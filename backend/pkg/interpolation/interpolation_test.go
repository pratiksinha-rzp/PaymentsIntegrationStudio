package interpolation

import "testing"

func TestResolveString(t *testing.T) {
	variables := map[string]interface{}{
		"order.id": "order_123",
	}

	input := "Order ID: {{order.id}}"

	result, err := ResolveString(input, variables)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	expected := "Order ID: order_123"

	if result != expected {
		t.Fatalf("expected %q, got %q", expected, result)
	}
}

func TestResolveMap(t *testing.T) {
	variables := map[string]interface{}{
		"order.id": "order_123",
	}

	input := map[string]interface{}{
		"order_id": "{{order.id}}",
		"amount":   50000,
	}

	result, err := ResolveMap(input, variables)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if result["order_id"] != "order_123" {
		t.Fatalf(
			"expected order_id %q, got %v",
			"order_123",
			result["order_id"],
		)
	}

	if result["amount"] != 50000 {
		t.Fatalf(
			"expected amount %v, got %v",
			50000,
			result["amount"],
		)
	}
}
