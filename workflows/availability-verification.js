// Availability Verification Workflow for Verifiable Rental Protocol
// This workflow checks property availability from external APIs

const availabilityWorkflow = {
  id: "availability_check_v1",
  name: "Property Availability Verification",
  description: "Verifies property availability using external property management APIs",

  // Workflow configuration
  config: {
    timeout: 30000, // 30 seconds
    retries: 2,
    privacy: "public" // Availability data is public
  },

  // Input schema
  inputs: {
    propertyId: {
      type: "string",
      required: true,
      description: "Unique property identifier"
    },
    checkInDate: {
      type: "string",
      required: true,
      format: "date",
      description: "Check-in date (ISO 8601)"
    },
    checkOutDate: {
      type: "string",
      required: true,
      format: "date",
      description: "Check-out date (ISO 8601)"
    }
  },

  // Workflow steps
  steps: [
    {
      id: "fetch_property_data",
      name: "Fetch Property Availability",
      type: "api_call",
      config: {
        method: "GET",
        url: "${PROPERTY_API_BASE_URL}/properties/${inputs.propertyId}/availability",
        headers: {
          "Authorization": "Bearer ${ENCRYPTED_API_KEY}",
          "Content-Type": "application/json"
        },
        params: {
          check_in: "${inputs.checkInDate}",
          check_out: "${inputs.checkOutDate}"
        }
      },
      outputs: {
        availability: "$.available",
        price: "$.price_per_night",
        currency: "$.currency",
        api_response_hash: "hash($.raw_response)"
      },
      error_handling: {
        on_failure: "retry",
        fallback: {
          availability: false,
          error: "API call failed"
        }
      }
    },

    {
      id: "validate_dates",
      name: "Validate Date Range",
      type: "condition",
      condition: "${steps.fetch_property_data.outputs.availability} === true && ${inputs.checkInDate} < ${inputs.checkOutDate}",
      on_true: {
        status: "available",
        message: "Property is available for the requested dates"
      },
      on_false: {
        status: "unavailable",
        message: "Property is not available or invalid date range"
      }
    },

    {
      id: "generate_attestation",
      name: "Generate Cryptographic Attestation",
      type: "sign_result",
      inputs: {
        workflow_id: "${workflow.id}",
        property_id: "${inputs.propertyId}",
        availability_status: "${steps.validate_dates.status}",
        timestamp: "${timestamp}",
        api_response_hash: "${steps.fetch_property_data.outputs.api_response_hash}"
      },
      signature: {
        algorithm: "keccak256",
        key_type: "krnl_node_key"
      },
      outputs: {
        attestation: {
          schema: "rental-verification-v1",
          workflow_id: "${workflow.id}",
          timestamp: "${timestamp}",
          property_id: "${inputs.propertyId}",
          availability: "${steps.validate_dates.status}",
          proof: {
            api_response_hash: "${steps.fetch_property_data.outputs.api_response_hash}",
            execution_trace: "hash(${execution_trace})"
          },
          signature: "${signature}"
        }
      }
    }
  ],

  // Output schema
  outputs: {
    available: {
      type: "boolean",
      source: "steps.validate_dates.status === 'available'"
    },
    attestation: {
      type: "object",
      source: "steps.generate_attestation.outputs.attestation"
    },
    metadata: {
      type: "object",
      properties: {
        property_id: "${inputs.propertyId}",
        check_in: "${inputs.checkInDate}",
        check_out: "${inputs.checkOutDate}",
        verified_at: "${timestamp}"
      }
    }
  },

  // Error handling
  error_handling: {
    on_timeout: {
      available: false,
      error: "Workflow timeout",
      attestation: null
    },
    on_max_retries: {
      available: false,
      error: "Max retries exceeded",
      attestation: null
    }
  }
};

module.exports = availabilityWorkflow;
