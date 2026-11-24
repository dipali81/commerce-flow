package com.commerceflow.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class OrderFlowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void completeCheckoutFlowFromRegistrationToOrderHistory() throws Exception {
        String adminToken = login("admin@commerceflow.dev", "Admin@123");
        String sku = "FLOW-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        MvcResult productResult = mockMvc.perform(post("/api/admin/products")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "sku":"%s",
                                  "name":"Flow Test Product",
                                  "description":"Used by checkout integration test",
                                  "category":"Testing",
                                  "price":250.00,
                                  "stockQuantity":10,
                                  "active":true
                                }
                                """.formatted(sku)))
                .andExpect(status().isCreated())
                .andReturn();
        long productId = objectMapper.readTree(productResult.getResponse().getContentAsString())
                .at("/data/id").asLong();

        String email = "order-user-" + UUID.randomUUID().toString().substring(0, 8) + "@example.com";
        MvcResult registerResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"fullName":"Order User","email":"%s","password":"Password@123"}
                                """.formatted(email)))
                .andExpect(status().isCreated())
                .andReturn();
        String token = tokenFrom(registerResult);

        mockMvc.perform(post("/api/cart/items")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"productId":%d,"quantity":2}
                                """.formatted(productId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.totalItems").value(2))
                .andExpect(jsonPath("$.data.subtotal").value(500.00));

        mockMvc.perform(get("/api/cart").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items[0].quantity").value(2));

        MvcResult checkoutResult = mockMvc.perform(post("/api/orders/checkout")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "shippingLine1":"123 Test Street",
                                  "shippingLine2":"Floor 2",
                                  "city":"Hyderabad",
                                  "postalCode":"500001",
                                  "country":"India"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("CONFIRMED"))
                .andExpect(jsonPath("$.data.totalAmount").value(500.00))
                .andReturn();
        JsonNode order = objectMapper.readTree(checkoutResult.getResponse().getContentAsString());
        String orderNumber = order.at("/data/orderNumber").asText();
        assertThat(orderNumber).startsWith("ORD-");

        mockMvc.perform(get("/api/orders").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].orderNumber").value(orderNumber));

        mockMvc.perform(get("/api/products/{id}", productId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.stockQuantity").value(8));

        mockMvc.perform(get("/api/cart").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalItems").value(0));

        mockMvc.perform(post("/api/cart/items")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"productId":%d,"quantity":20}
                                """.formatted(productId)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("Conflict"));

        mockMvc.perform(post("/api/orders/checkout")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"shippingLine1":"1 Main","city":"Hyderabad","postalCode":"500001","country":"India"}
                                """))
                .andExpect(status().isBadRequest());
    }

    private String login(String email, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"%s","password":"%s"}
                                """.formatted(email, password)))
                .andExpect(status().isOk())
                .andReturn();
        return tokenFrom(result);
    }

    private String tokenFrom(MvcResult result) throws Exception {
        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        return json.at("/data/accessToken").asText();
    }
}
