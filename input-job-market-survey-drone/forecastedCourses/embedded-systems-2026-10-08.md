# Course plan — Modern Embedded Systems (catch-up stack)

> Forecasted course for the **GeberLMS / LMS Helveticore** catalogue.
> Status: **planning (incremental build)**.
> Complements: `embedded-software-design/` (the *design methodology*) and
> `iot/` (the *connectivity* layer). This one is the **hands-on embedded stack**.

---

## 1. Why this course

The drone's embedded/IoT survey now surfaces the concrete gaps that make the
profile feel "phased out". Across the top 40 embedded/IoT offers, the recurring
demands are:

- **automotive (17)** and **AUTOSAR (5)** — Bosch ADAS/automotive.
- **embedded Linux (4)** — Canonical's entire catalogue.
- **functional safety** — ISO 26262 (3) + IEC 61508 (2).
- **OTA (3)**, **MISRA (2)**, **microcontroller (2)**, **PLC (2)**,
  **CAN bus / sensor fusion / signal processing**.

This course closes those gaps in dependency order, from the MCU up to the
safety case.

## 2. Learning outcomes

1. Stand up a modern RTOS project (FreeRTOS, then **Zephyr**) on an emulated MCU.
2. Write **reusable, unit-tested device drivers** behind a clean **HAL**.
3. Build a **bootloader + signed OTA** update path.
4. Produce and boot an **embedded Linux (Buildroot/Yocto)** image.
5. Apply **MISRA C** and argue a **functional-safety case (IEC 61508 / ISO 26262)**.
6. Understand the **AUTOSAR** architecture and where it applies.
7. Refresh **FPGA/HDL** (Verilog/VHDL) and **DSP/signal-processing** touchpoints.

## 3. Audience & prerequisites

- **Audience**: an embedded engineer with classic experience (ARM Cortex,
  FreeRTOS, Yocto, FPGA) who needs the *modern* stack: Zephyr, embedded Linux
  distros, bootloaders/OTA, and safety standards.
- **Prerequisites**: C (pointers, structs, ISRs), basic RTOS concepts, basic
  Linux command line. No board required (simulation-first).

## 4. Tooling

- **Emulation**: QEMU + **Renode** (STM32/Cortex-M, FreeRTOS, Zephyr native_sim).
- **Build/test**: CMake + GCC/Clang, CppUTest/Unity, cppcheck (MISRA addon).
- **Linux**: Buildroot/Yocto → QEMU boot.
- **HDL**: Icarus Verilog + GHDL (simulation, no board/license).
- Later: a real STM32 Nucleo / ESP32 / nRF board for physical labs.

## 5. Module breakdown (incremental)

Each module: **theory note + worked example + self-checking exercise +
deliverable**.

### E1 — Modern RTOS (FreeRTOS → Zephyr)
- Tasks, semaphores, queues, priorities; port one design from FreeRTOS to Zephyr.
- **Gap**: Zephyr. **Source**: Beningo Zephyr RTOS Bootcamp + FreeRTOS toolkits.
- Deliverable: one design running on both RTOSes in Renode.

### E2 — Reusable drivers & HAL
- Peripheral abstraction, config tables, pointer arrays, unit-tested drivers.
- **Gap**: device driver / microcontroller / HAL. **Source**: Beningo driver white paper.
- Deliverable: a small driver library (UART/timer) with host-run tests.

### E3 — Bootloader & OTA
- Start-up code, vector table, A/B update, signing/rollback.
- **Gap**: bootloader + OTA. **Source**: Beningo bootloader white paper + OTA articles.
- Deliverable: a bootloader + signed OTA demo on Renode.

### E4 — Embedded Linux
- Kernel config, device tree, rootfs, user/kernel split; Buildroot then Yocto.
- **Gap**: embedded Linux. **Source**: Canonical postings + Buildroot/Yocto docs.
- Deliverable: a reproducible Buildroot image booting in QEMU.

### E5 — Functional safety & MISRA
- SIL/ASIL, hazard analysis/FMEA, safety case; MISRA C compliance run.
- **Gap**: ISO 26262 / IEC 61508 / MISRA. **Source**: Bosch/Somfy safety postings.
- Deliverable: a hazard analysis + a MISRA-clean module.

### E6 — AUTOSAR & automotive
- Classic AUTOSAR (BSW/RTE/application), ADAS context, CAN/CAN-FD.
- **Gap**: AUTOSAR + automotive + CAN bus. **Source**: Bosch ADAS postings.
- Deliverable: an AUTOSAR architecture map + a CAN/FD example.

### E7 — FPGA/HDL refresh + DSP
- Verilog/VHDL side-by-side (already in history), signal-processing touchpoints.
- **Gap**: Verilog/VHDL + signal processing/DSP. **Source**: existing FPGA history + training-to-prepare Priority 1.
- Deliverable: a small FPGA design + a DSP filter in C/simulation.

## 6. Publishing plan

1. Ship E1–E3 (RTOS → drivers → bootloader) as the "modern firmware" track.
2. Add E4 (embedded Linux) and E5 (safety) as the "production" track.
3. Add E6 (AUTOSAR) conditionally — only if automotive becomes a target sector.
4. Publish on **lms.helveticore.com**; link `edge-*` portfolio repos as worked examples.

## 7. Status & next step

- [ ] Create `forecastedCourses/embedded-systems/` (this file).
- [ ] Draft E1 theory note + Renode example (first increment).
- [ ] Wire into GeberLMS catalogue (course → modules → lessons).
