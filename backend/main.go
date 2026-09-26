package main

import (
	"fmt"
	"log"
	"net/http"
	"strings"

	"payments-integration-studio/internal/credential"
	"payments-integration-studio/internal/execution"
	"payments-integration-studio/internal/orchestrator"
	"payments-integration-studio/internal/replay"
	"payments-integration-studio/internal/scenario"
	"payments-integration-studio/pkg/database"
	"payments-integration-studio/pkg/httpclient"
)

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	fmt.Fprintln(w, "Payments Integration Studio Backend is running")
}

func main() {
	db, err := database.Connect()
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// -------------------------------------------------------------------------
	// Scenario dependencies
	// -------------------------------------------------------------------------

	scenarioRepo := scenario.NewRepository(db)
	scenarioService := scenario.NewService(scenarioRepo)
	scenarioHandler := scenario.NewHandler(scenarioService)

	// -------------------------------------------------------------------------
	// Execution dependencies
	// -------------------------------------------------------------------------

	executionRepo := execution.NewRepository(db)
	executionService := execution.NewService(executionRepo)
	executionHandler := execution.NewHandler(executionService)

	// -------------------------------------------------------------------------
	// Credential dependencies
	// -------------------------------------------------------------------------

	credentialRepo := credential.NewRepository(db)
	credentialService := credential.NewService(credentialRepo)
	credentialHandler := credential.NewHandler(credentialService)

	// -------------------------------------------------------------------------
	// Replay dependencies
	// -------------------------------------------------------------------------

	httpClient := httpclient.NewClient("https://api.razorpay.com")

	replayService := replay.NewService(
		httpClient,
		scenarioRepo,
		credentialRepo,
		executionService,
	)

	// Replay handler
	replayHandler := replay.NewHandler(replayService)

	// -------------------------------------------------------------------------
	// Orchestrator dependencies
	// -------------------------------------------------------------------------

	orchestratorService := orchestrator.NewService(
		executionService,
		scenarioService,
		replayService,
	)

	// Orchestrator handler
	orchestratorHandler := orchestrator.NewHandler(orchestratorService)

	// -------------------------------------------------------------------------
	// Scenario collection API
	// -------------------------------------------------------------------------

	http.HandleFunc("/api/v1/scenarios", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			scenarioHandler.Create(w, r)
			return
		}

		if r.Method == http.MethodGet {
			scenarioHandler.GetAll(w, r)
			return
		}

		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
	})

	// -------------------------------------------------------------------------
	// Single scenario / scenario step API
	// -------------------------------------------------------------------------

	http.HandleFunc("/api/v1/scenarios/", func(w http.ResponseWriter, r *http.Request) {
		path := strings.TrimPrefix(
			r.URL.Path,
			"/api/v1/scenarios/",
		)

		// ---------------------------------------------------------------------
		// PUT APIs
		// ---------------------------------------------------------------------

		if r.Method == http.MethodPut {
			// /api/v1/scenarios/{scenario_id}/steps/{step_id}
			if strings.Contains(path, "/steps/") {
				scenarioHandler.UpdateStep(w, r)
				return
			}

			// /api/v1/scenarios/{scenario_id}
			scenarioHandler.Update(w, r)
			return
		}

		// ---------------------------------------------------------------------
		// GET APIs
		// ---------------------------------------------------------------------

		if r.Method == http.MethodGet {
			// /api/v1/scenarios/{id}/steps
			if strings.HasSuffix(path, "/steps") {
				scenarioHandler.GetSteps(w, r)
				return
			}

			// /api/v1/scenarios/{id}
			scenarioHandler.GetByID(w, r)
			return
		}

		// ---------------------------------------------------------------------
		// POST APIs
		// ---------------------------------------------------------------------

		if r.Method == http.MethodPost {
			// /api/v1/scenarios/{id}/clone
			if strings.HasSuffix(path, "/clone") {
				scenarioHandler.Clone(w, r)
				return
			}

			// /api/v1/scenarios/{id}/steps
			if strings.HasSuffix(path, "/steps") {
				scenarioHandler.CreateStep(w, r)
				return
			}
		}

		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
	})

	// -------------------------------------------------------------------------
	// Execution collection API
	// -------------------------------------------------------------------------

	http.HandleFunc("/api/v1/executions", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			executionHandler.Create(w, r)
			return
		}

		if r.Method == http.MethodGet {
			executionHandler.GetAll(w, r)
			return
		}

		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
	})

	// -------------------------------------------------------------------------
	// Single execution / execution step / run API
	// -------------------------------------------------------------------------

	http.HandleFunc("/api/v1/executions/", func(w http.ResponseWriter, r *http.Request) {
		path := strings.TrimPrefix(
			r.URL.Path,
			"/api/v1/executions/",
		)

		// /api/v1/executions/{id}/run
		if strings.HasSuffix(path, "/run") {
			if r.Method == http.MethodPost {
				orchestratorHandler.Run(w, r)
				return
			}

			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}

		// /api/v1/executions/{id}/steps
		if strings.HasSuffix(path, "/steps") {
			if r.Method == http.MethodGet {
				executionHandler.GetSteps(w, r)
				return
			}

			if r.Method == http.MethodPost {
				executionHandler.CreateStep(w, r)
				return
			}

			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}

		// /api/v1/executions/{id}
		if r.Method == http.MethodGet {
			executionHandler.GetByID(w, r)
			return
		}

		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
	})

	// -------------------------------------------------------------------------
	// Credential collection API
	// -------------------------------------------------------------------------

	http.HandleFunc("/api/v1/credentials", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			credentialHandler.Create(w, r)
			return
		}

		if r.Method == http.MethodGet {
			credentialHandler.GetAll(w, r)
			return
		}

		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
	})

	// -------------------------------------------------------------------------
	// Single credential API
	// -------------------------------------------------------------------------

	http.HandleFunc("/api/v1/credentials/", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			credentialHandler.GetByID(w, r)
			return
		}

		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
	})

	// -------------------------------------------------------------------------
	// Replay API - Scenario Step Replay
	// -------------------------------------------------------------------------

	http.HandleFunc("/api/v1/replay", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			replayHandler.ReplayStep(w, r)
			return
		}

		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
	})

	// -------------------------------------------------------------------------
	// Standalone API Replay
	// -------------------------------------------------------------------------

	http.HandleFunc("/api/v1/replay/api", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			replayHandler.ReplayAPI(w, r)
			return
		}

		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
	})

	// -------------------------------------------------------------------------
	// Health check
	// -------------------------------------------------------------------------

	http.HandleFunc("/health", healthHandler)

	// -------------------------------------------------------------------------
	// Start server
	// -------------------------------------------------------------------------

	log.Println("Payments Integration Studio Backend running on :8080")

	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal(err)
	}
}
