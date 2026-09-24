package interpolation

import "testing"

func TestExtractJSONPath(t *testing.T) {
	body := []byte(`{
		"id": "order_123",
		"amount": 50000,
		"customer": {
			"name": "Test User"
		}
	}`)

	value, err := ExtractJSONPath(body, "id")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if value != "order_123" {
		t.Fatalf("expected %q, got %v", "order_123", value)
	}
}

func TestExtractNestedJSONPath(t *testing.T) {
	body := []byte(`{
		"customer": {
			"name": "Test User"
		}
	}`)

	value, err := ExtractJSONPath(body, "customer.name")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if value != "Test User" {
		t.Fatalf("expected %q, got %v", "Test User", value)
	}
}
