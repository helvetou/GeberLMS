# Course plan — Professional Embedded Software Design

> Forecasted course for the **GeberLMS / LMS Helveticore** catalogue.
> Source of inspiration: **Jacob Beningo — Beningo Embedded Group**
> (https://www.beningo.com/insights/). Status: **planning (incremental build)**.

---

## 1. Why this course

Beningo's material is one of the most coherent, practitioner-grade treatments of
*embedded software design as a discipline* — principles, architecture patterns,
and a repeatable design process — rather than a collection of "here is some C
code". It maps directly onto:

- **Our profile** — embedded software engineer (STMicroelectronics, Innotest AG),
  firmware + test infrastructure + AI-driven quality.
- **The job-market gaps** — the drone's survey shows embedded/IoT roles (Bosch,
  Somfy, Canonical, u-blox…) scoring high; their recurring demands are exactly
  this course's topics: HALs, RTOS, device drivers, bootloaders, watchdogs,
  defensive programming, TDD.
- **The existing roadmap** — `docs/roadmap/training-to-prepare.md` already lists
  firmware-quality gaps (Docker/K8s, CI/CD, backend, MLOps) as Priority 2. This
  course is the *embedded software design* backbone that those sit on.

## 2. Source of truth (what we mined)

Beningo's site organizes into resources we can reuse as course material:

- **"Embedded Software Design: A Complete Guide for Engineers"**
  (`/embedded-software-design/`) — the 7 design principles, architecture
  patterns, and the design process (ADRs, C4 model, data-flow diagrams, state
  machines, architecture reviews).
- **White papers** — *A Review of Watchdog Architectures*, *Developing Reusable
  Device Drivers for MCUs*, *Bootloader Design for Microcontrollers*.
- **Toolkits** (downloadable starter projects) — cooperative scheduler,
  FreeRTOS baseline (STM32/K64F), RTOS selection matrix, printf starter,
  C-to-C++ transition, ESP8266 MicroPython sensor nodes, defensive-programming
  project.
- **"Embedded Basics" article archive** (EDN + DesignNews) — MCU start-up code,
  APIs vs HALs, abstract data types in C, pointer arrays to map peripherals,
  static keyword, portable C optimizations, static analysis, TDD, OTA updates,
  "7 reasons to use an RTOS".
- **Training products** to reference — *Embedded Software Architecture
  Masterclass*, *Zephyr RTOS Bootcamp*, *Faster. Smarter. Firmware.*.

## 3. Learning outcomes

After the course the learner can:

1. State and apply the 7 embedded software design principles.
2. Partition firmware into layered architecture with clean **APIs vs HALs**.
3. Write **reusable, portable device drivers** and peripheral configuration.
4. Model a design with **data-flow diagrams, state machines, C4, and ADRs**.
5. Build a **bare-metal cooperative scheduler** and then an **RTOS** design
   (tasks, semaphores, queues) and choose between them.
6. Engineer robustness: **watchdogs, defensive programming, static analysis,
   and TDD (CppUTest)**.
7. Bring up an **IoT sensor node** and understand **OTA/bootloader** delivery.

## 4. Audience & prerequisites

- **Audience**: engineers moving from "code that works" to "firmware that
  survives 10 years of product evolution"; also senior reviewers.
- **Prerequisites**: C (comfortable with pointers, structs, function pointers);
  basic microcontroller concepts (registers, interrupts, UART/I2C/SPI at a high
  level). No board strictly required — see tooling below.

## 5. Course philosophy (inherited from Beningo)

- *Data dictates design* — identify data flow before modules.
- *There is no hardware, only data* — design around data, not peripherals.
- *KISS* — the simplest code a junior can read.
- *Architecture evolves* (IEEE 1471: "guiding its design and evolution").
- *Design to configure, not to copy* — product-family thinking.
- *Quality begins in design* — not added during system test.

## 6. Tooling (simulation-first, no board required to start)

- **Build/unit-test**: GCC/Clang + CMake + CppUTest (or Unity).
- **Hardware emulation**: QEMU + **Renode** (STM32/FreeRTOS without hardware);
  later a real STM32 Nucleo / ESP32 for the physical labs.
- **Static analysis**: cppcheck, `-Wall -Wextra`, MISRA-style checks (later).
- **Tracing**: SEGGER SystemView or Percepio Tracealyzer (optional, board-based).
- **Diagrams**: Mermaid/PlantUML for data-flow, state machines, C4.

## 7. Module breakdown (incremental)

Each module ships as: **theory note + worked example + self-checking exercise +
deliverable**. Built in this order (each depends on the previous):

### M1 — Design principles
- The 7 principles; data-first thinking; IEEE 1471 architecture definition.
- Lab: reverse-engineer a small sample firmware and redraw its data flow.
- **Source**: `/embedded-software-design/` (principles section).
- Deliverable: one-page "data contract" for a toy device (e.g. a sensor hub).

### M2 — APIs vs HALs & layered architecture
- Abstraction layers, the API/HAL boundary, Arm CMSIS as a concrete HAL.
- Lab: write a GPIO/UART HAL with two backends (mock + simulated), same API.
- **Source**: *"How to write epic HALs in C"*, *"APIs vs HALs"*, CMSIS intro.
- Deliverable: a HAL + API with a passing unit test (host-compiled).

### M3 — The design process
- ADRs, C4 model (Context/Containers/Components/Code), data-flow diagrams,
  state machines, architecture reviews.
- Lab: write an ADR + C4 + state machine for the sensor hub from M1.
- **Source**: `/embedded-software-design/` (design process section) + Masterclass topics.
- Deliverable: a mini architecture pack (ADR + C4 + FSM).

### M4 — Reusable device drivers
- Driver API design, pointer arrays to map peripherals, configuration tables,
  abstract data types in C, `static` discipline.
- Lab: timer + UART driver using config tables, unit-tested on the host.
- **Source**: *"Developing Reusable Device Drivers for MCUs"* + Embedded Basics articles.
- Deliverable: two reusable drivers + tests.

### M5 — MCU foundations & bootloader
- Start-up code, memory map, linker script, reset vector, bootloader design.
- Lab: trace start-up to `main()` on Renode; write a minimal bootloader stub.
- **Source**: *"The hidden world of MCU start-up code"*, *"Bootloader Design…"*.
- Deliverable: a documented start-up walkthrough + bootloader sequence diagram.

### M6 — Schedulers & RTOS
- Cooperative scheduler → preemptive RTOS; tasks, semaphores, queues, priorities;
  how to pick an RTOS.
- Lab: cooperative scheduler first, then the same design in FreeRTOS on Renode.
- **Source**: cooperative-scheduler toolkit + FreeRTOS toolkits + *"7 reasons to use an RTOS"* + RTOS selection matrix.
- Deliverable: one design implemented both ways + a written rationale.

### M7 — Robustness & quality
- Watchdog architectures, defensive programming, static analysis, TDD (CppUTest),
  software start-up checklist.
- Lab: add a watchdog + defensive checks + a test suite to the M6 design.
- **Source**: *"A Review of Watchdog Architectures"*, defensive-programming toolkit, TDD articles.
- Deliverable: a hardened build with tests + static-analysis report.

### M8 — IoT bring-up & OTA
- Sensor nodes, MicroPython vs C, OTA update challenges, secure update flow.
- Lab: ESP32/ESP8266 sensor node publishing telemetry; sketch an A/B OTA flow.
- **Source**: ESP8266 MicroPython toolkit + *"Overcoming 5 challenges with OTA"* + IoT articles.
- Deliverable: a working sensor node + an OTA sequence design.

## 8. Publishing plan (GeberLMS)

1. Author M1–M3 as the "design" core (high reuse, no board needed).
2. Package as a GeberLMS course with quizzes (the LLM quiz infra already exists).
3. Add M4–M6 (drivers, bootloader, RTOS) as the "hands-on" track.
4. Add M7–M8 as the "production" track; tie to `geber-*` portfolio projects.
5. Publish on **lms.helveticore.com**; link back to the portfolio repo as the
   "worked examples" backing each module.

## 9. Status & next step

- [ ] Create `forecastedCourses/embedded-software-design/` (this file).
- [ ] Draft M1 theory note + worked example (first increment).
- [ ] Wire the course into the GeberLMS catalogue schema (course, modules, lessons).
- [ ] Record the same decision in the drone's `SESSION_CONTEXT.md`.
