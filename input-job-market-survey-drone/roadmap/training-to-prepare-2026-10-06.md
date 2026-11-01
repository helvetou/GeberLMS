# Training to prepare

Roadmap of the *course material* to prepare (for self-learning and as potential
GeberLMS catalog content). Nothing here is written yet — this is the plan.

## Priority 1 — Verilog + VHDL (the "no skills today" gap)

A simulation-first course (Icarus Verilog + GHDL, no board or license needed).

1. **Foundations** — hardware is parallel; combinational vs sequential; clock,
   reset, edge; simulation vs synthesis.
2. **Combinational** — wires/registers, `assign`, bitwise ops, mux, adder,
   decoder/encoder, 7-segment decoder. VHDL: entity/architecture, `std_logic`,
   `with/select`.
3. **Sequential** — the flip-flop template, blocking vs non-blocking, sync/async
   reset, counters, shift registers, clock dividers.
4. **Finite state machines** — Moore vs Mealy, the 3-block pattern, state encoding,
   `default`/`others` branches, sequence detectors.
5. **Serial protocols** — UART tx/rx, baud-rate division, oversampling, loopback.
6. **Memory & data paths** — FIFO, RAM, pipelines, latency vs throughput.
7. **Verification** — self-checking testbenches, waveforms, directed + random tests,
   then cocotb (Python) and Verilator.
8. **Synthesis & hardware** — Yosys/nextpnr + Vivado/Quartus, constraints, timing,
   board bring-up.

Delivery format per module: theory note + a working example + a self-checking
testbench + exercises. Verilog and VHDL taught side by side (same design in both).

## Priority 2 — the recurring software gaps (from `generated/skills_demand.md`)

- **Docker → Kubernetes** — containerize, orchestrate, autoscale (project `geber-infra`, `geber-k8s`).
- **CI/CD & DevOps** — a complete pipeline as a reproducible demo.
- **Backend data path** — FastAPI → PostgreSQL/Redis → GraphQL (project `geber-api`).
- **MLOps + RAG in production** — LangChain/Hugging Face + evaluation loop (project `geber-rag`).
- **Cloud** — AWS IoT Core + Lambda, GCP Cloud Run, Terraform (project `geber-cloud`).

## Priority 3 — keep it honest

- Re-word (don't rebuild): `FPGA`, `VHDL`, `Verilog` are already in your history.
- Skip or defer the low-demand long tail (ruby, php, scala, kotlin, flutter, vue,
  angular, spring) unless a specific posting keeps repeating them.
