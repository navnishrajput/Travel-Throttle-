package com.travelthrottle.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CostBreakdownResponse {
    private Double distance;
    private Double fuelPrice;
    private Double bikeMileage;
    private Double fuelCost;
    private Double tollCost;
    private Double maintenanceCost;
    private Double driverAllowance;
    private Double totalCost;
    private Double costPerPerson;
    private Double suggestedPrice;
}