package httpclient

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

type Request struct {
	Method      string
	URL         string
	Headers     map[string]interface{}
	QueryParams map[string]interface{}
	Body        map[string]interface{}
}

type Response struct {
	StatusCode int
	Headers    map[string]string
	Body       []byte
	LatencyMs  int64
}

type Client struct {
	httpClient *http.Client
	baseURL    string
}

func NewClient(baseURL string) *Client {
	return &Client{
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
		baseURL: baseURL,
	}
}

func (c *Client) Do(
	ctx context.Context,
	reqData Request,
	keyID string,
	keySecret string,
) (*Response, error) {
	var bodyReader io.Reader

	if reqData.Body != nil {
		body, err := json.Marshal(reqData.Body)
		if err != nil {
			return nil, err
		}

		bodyReader = bytes.NewReader(body)
	}

	reqURL := reqData.URL

	// Convert relative URLs into full URLs.
	if !strings.HasPrefix(reqURL, "http://") &&
		!strings.HasPrefix(reqURL, "https://") {
		reqURL = strings.TrimRight(c.baseURL, "/") +
			"/" +
			strings.TrimLeft(reqURL, "/")
	}

	// Add query parameters.
	if len(reqData.QueryParams) > 0 {
		parsedURL, err := url.Parse(reqURL)
		if err != nil {
			return nil, err
		}

		query := parsedURL.Query()

		for key, value := range reqData.QueryParams {
			query.Set(key, stringValue(value))
		}

		parsedURL.RawQuery = query.Encode()
		reqURL = parsedURL.String()
	}

	request, err := http.NewRequestWithContext(
		ctx,
		reqData.Method,
		reqURL,
		bodyReader,
	)
	if err != nil {
		return nil, err
	}

	// Razorpay API authentication.
	request.SetBasicAuth(keyID, keySecret)

	for key, value := range reqData.Headers {
		request.Header.Set(key, stringValue(value))
	}

	if reqData.Body != nil &&
		request.Header.Get("Content-Type") == "" {
		request.Header.Set("Content-Type", "application/json")
	}

	start := time.Now()

	response, err := c.httpClient.Do(request)
	if err != nil {
		return nil, err
	}

	defer response.Body.Close()

	responseBody, err := io.ReadAll(response.Body)
	if err != nil {
		return nil, err
	}

	responseHeaders := make(map[string]string)

	for key, values := range response.Header {
		if len(values) > 0 {
			responseHeaders[key] = values[0]
		}
	}

	return &Response{
		StatusCode: response.StatusCode,
		Headers:    responseHeaders,
		Body:       responseBody,
		LatencyMs:  time.Since(start).Milliseconds(),
	}, nil
}

func stringValue(value interface{}) string {
	switch v := value.(type) {
	case string:
		return v
	default:
		data, _ := json.Marshal(v)
		return string(data)
	}
}
