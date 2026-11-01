# Proposed new projects

Each project closes one or more skill gaps detected by the job-market drone,
and builds on something you already have (`EdgeStream-GW`, `geberMath`,
`geberstealth`, `BioRAG`, `RAG6Dec`, `transciptextractor`).

## A. Hardware / FPGA (closes the Verilog + VHDL gap)

Goal: go from *no HDL skills* to a small, demonstrable hardware portfolio.

1. **`blinky` bring-up kit** — LED blink + debounced button + 7-segment counter.
   First real board bring-up. Closes: Verilog/VHDL basics, clock, reset, FPGA flow.
2. **UART echo + command shell** — a serial loopback then a tiny shell (`L<n>` sets
   an LED). Closes: timing, baud rate, FSMs, protocol handling.
3. **PWM dimmer / servo driver** — timers + PWM to control an LED or a hobby servo.
4. **VGA/HDMI test-pattern generator** — pixel clock, counters, sync pulses, color bars.
5. **Mini CPU** — a tiny accumulator/stack machine (fetch/decode/execute FSM).
   The capstone that proves you can design stateful digital systems.
6. **`geber-edge-ai`** — a hardware block that runs a quantized model and pairs
   with `EdgeStream-GW`. This is the embedded × AI crossover that differentiates
   you on the market.

Suggested order: 1 → 2 → 3 → 5 → 4/6. Each one is a separate git repo with a
README + self-checking testbench + waveform screenshot.

## B. Software / Geber ecosystem (closes the recurring software gaps)

1. **`geber-infra`** — Docker + docker-compose + a GitHub Actions/GitLab CI
   pipeline around `geberMath` and `EdgeStream-GW`. Closes: docker, devops, CI/CD.
2. **`geber-dashboard`** — a React/TypeScript admin dashboard over
   `EdgeStream-GW` Modbus data. Closes: react, node (NestJS API), real-time data.
3. **`geber-api`** — a FastAPI + PostgreSQL + Redis + GraphQL backend for
   `geberMath` / `geberstealth` (exam bank, catalog). Closes: fastapi, postgresql,
   redis, graphql.
4. **`geber-rag`** — migrate `BioRAG` / `RAG6Dec` to LangChain + Hugging Face
   embeddings with an evaluation loop. Closes: langchain, hugging face, mlops.
5. **`geber-cloud`** — deploy one service to AWS (IoT Core + Lambda) and mirror it
   on GCP (Cloud Run) using Terraform. Closes: aws, gcp, terraform, kubernetes.
6. **`geber-k8s`** — Helm chart + autoscaling for `geberMath`. Closes: kubernetes.

Suggested order: 1 → 3 → 4 → 2 → 5/6 (whatever the current gap ranking says).

## C. Not to build (already covered — just reword)

- **FPGA**: you have prior Xilinx Vivado / MPSOC / Ultrascale experience at
  Innotest and STMicroelectronics. The drone flags "fpga" only because the profile
  doesn't name `FPGA`, `VHDL`, `Verilog` explicitly. Fix the wording; don't rebuild
  the skill from zero.
