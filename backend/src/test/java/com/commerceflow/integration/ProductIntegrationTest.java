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
class ProductIntegrationTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void publicCanListSearchAndReadProductDetails() throws Exception {
        MvcResult listResult = mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content").isArray())
                .andReturn();
        JsonNode list = objectMapper.readTree(listResult.getResponse().getContentAsString());
        assertThat(list.at("/data/totalElements").asLong()).isGreaterThan(0);
        long firstId = list.at("/data/content/0/id").asLong();

        mockMvc.perform(get("/api/products/{id}", firstId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(firstId));

        mockMvc.perform(get("/api/products").param("category", "Books").param("size", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].category").value("Books"));
    }

    @Test
    void invalidPaginationReturnsBadRequest() throws Exception {
        mockMvc.perform(get("/api/products").param("size", "0"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Bad request"));
    }

    @Test
    void onlyAdminCanCreateProducts() throws Exception {
        String sku = "TEST-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        String body = """
                {
                  "sku":"%s",
                  "name":"Integration Test Product",
                  "description":"Created by integration test",
                  "category":"Testing",
                  "price":123.45,
                  "stockQuantity":25,
                  "active":true
                }
                """.formatted(sku);

        String userToken = registerAndGetToken();
        mockMvc.perform(post("/api/admin/products")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isForbidden());

        String adminToken = login("admin@commerceflow.dev", "Admin@123");
        mockMvc.perform(post("/api/admin/products")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.sku").value(sku))
                .andExpect(jsonPath("$.data.price").value(123.45));

        mockMvc.perform(post("/api/admin/products")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isConflict());
    }

    private String registerAndGetToken() throws Exception {
        String email = "product-user-" + UUID.randomUUID().toString().substring(0, 8) + "@example.com";
        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"fullName":"Product User","email":"%s","password":"Password@123"}
                                """.formatted(email)))
                .andExpect(status().isCreated())
                .andReturn();
        return tokenFrom(result);
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
