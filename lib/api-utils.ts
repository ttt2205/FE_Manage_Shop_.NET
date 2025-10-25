import type { ApiResponse, ApiListResponse, ApiErrorResponse } from "./types"

export function createSuccessResponse<T>(data: T, message = "Success"): ApiResponse<T> {
  return {
    success: true,
    status: 200,
    message,
    data,
  }
}

export function createListResponse<T>(results: T[], message = "Success"): ApiListResponse<T> {
  return {
    success: true,
    status: 200,
    message,
    results,
  }
}

export function createErrorResponse(error: string, message = "An error occurred", status = 500): ApiErrorResponse {
  return {
    success: false,
    status,
    error,
    message,
  }
}

// Simulate API delay
export function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
