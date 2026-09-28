# Role Description: Safety Test and Automation Engineer (AutoTherm)

> **Living document.** This is the internal reference for hiring managers and interviewers.
> It's updated as the role and the AutoTherm codebase evolve. See
> [Revision history](#revision-history) and [Codebase coverage](#codebase-coverage) at the bottom.
> The candidate-facing posting is
> [`safety-test-automation-engineer-posting.md`](safety-test-automation-engineer-posting.md).
> Keep the two in sync when qualifications change.

**Current version:** 6 (re-scoped from a junior developer role to a mid-level hybrid role:
a safety test engineer who also develops test-automation software)

---

## About the role

The Compliance Team works across all core hardware engineering product lines. This role
is split roughly **half hands-on safety testing, half software**:

- **In the lab:** perform product safety tests to **IEC 62368-1**. These include input,
  heating (thermal), dielectric withstand (hi-pot), touch current, ground bond (protective
  bonding), and abnormal/fault-condition tests. Setting up fault conditions often means
  soldering on small surface-mount parts.
- **In the code:** maintain and grow **AutoTherm**, our Python desktop app that automates
  thermal, input, and abnormal testing. Then extend automation to the tests AutoTherm
  doesn't cover yet (dielectric withstand, touch current, ground bond).

AutoTherm today:

1. Drives a programmable AC/DC power source to set voltages and frequencies
2. Reads up to four digital power meters and a chart recorder with up to 100 thermocouple channels
3. Logs room temperature and humidity from a networked environmental sensor
4. Runs **input tests** (power draw at each voltage and frequency), **thermal tests** (heat soak
   until temperatures stabilize), and **abnormal tests** (fault conditions such as a blocked
   vent or stalled fan)
5. Decides when a test **passes, fails, or has stabilized**, using the lab's criteria
6. Generates the **Word (.docx) test-report tables** that go into the official compliance
   report. The templates cite 62368-1 clauses B.2.5 (input) and 5.4.1.4, 9.3, B.1.5, B.2.6,
   B.3, B.4 (temperatures and abnormal conditions).

**Why a hybrid role:** the hardest problems found in the code review weren't Python
problems. They were questions like "which ambient temperature is correct?" and "should a
person be able to mark a test complete?". A developer who also performs the tests can
answer them. **The numbers this software produces end up in certification paperwork,
so correctness matters more than speed.**

**Level:** mid-level, 3+ years of related experience. The hire is expected to work
independently on most code changes, and to get sign-off from the lab's test engineering
lead on anything that changes pass/fail criteria or reported results.

---

## Responsibilities

### Safety testing

- Perform IEC 62368-1 tests: input, heating (thermal), dielectric withstand, touch current,
  ground bond, and abnormal/fault-condition tests
- Prepare samples: attach thermocouples, and solder fault conditions (shorts and opens) on
  surface-mount and through-hole parts, using a microscope when needed
- Follow high-voltage lab safety practices. Dielectric withstand testing uses thousands of volts.

### AutoTherm development

- Fix and improve the **Tkinter GUI**: main window, test configuration window (PSUs,
  up to 100 thermocouple channels, AC/DC test tables), connection settings window, and the
  **live results window** (a matplotlib chart embedded in Tkinter that updates every second)
- Maintain the **test procedures** in `test_scripts.py`:
  - *Input test:* set the voltage and frequency, sample the power meters once a second,
    fail if current goes over 110% of rated, pass when the last 10 power readings are
    within 15% of each other
  - *Thermal test:* sample power and temperature every N seconds, adjust temperatures to the
    manufacturer's rated ambient, fail on over-temperature, sensor faults, or a power drop,
    and pass on the 5-minute or 30-minute stability rule
  - Stop controls: `abort = 1` (stop and mark complete) and `abort = 2` (stop and discard)
- Maintain **instrument communication code** for:
  - Kikusui power sources: an older GPIB model (proprietary commands like `ACVSET`, `FSET`, `OUT ON`)
    and the networked PCR-WEA series (SCPI over VXI-11: `VOLT`, `VOLT:OFFS`, `FREQ`, `OUTP`)
  - Yokogawa WT310E digital power meters (SCPI: `:NUMeric:NORMal:VALue?`, `:INPut:MODE`)
  - A Yokogawa chart recorder with its own ASCII protocol (`_MFG`, `_INF`, `FData`, `EA…EN` framing, `E0`/`E1` status codes)
  - A Prologix GPIB-to-Ethernet adapter (`++mode`, `++addr`)
  - An environmental sensor with an HTTP/JSON endpoint (`/values.json`)
- Maintain the **report generator**, which builds Word tables by editing Office Open XML
  (OOXML) directly with lxml and XPath, then zips the result into a `.docx`. Keep the
  `.docx` templates and the code that fills them in sync.
- Add **automated tests and hardware simulators** (fake power meters, chart recorders, and
  power sources) so most of the code can be tested without lab equipment
- Maintain **exports** (CSV test logs, SVG charts) and the **project save/load format**
  (`.aut` and `.acs` files)
- Build and release the app with **PyInstaller** for Windows and macOS
- Help lab users with connection problems (IP addresses, GPIB addresses, timeouts)

### Expanding automation

- Extend automation beyond thermal testing to **dielectric withstand, touch current, and
  ground bond** tests. That means choosing how to control the lab's safety testers (most
  offer SCPI over LAN, USB, or RS-232), adding them to AutoTherm, and adding matching report tables.
- Move projects and test results from pickle files into a **SQL database** (see [SQL roadmap](#sql-roadmap))

### Team tooling

- Use AI coding agents to speed up development, with rigorous review of AI-generated code.
  This matters more than usual because the software produces certification data.
- Build AI skills or tools the team can reuse, for example a skill that knows how to add a
  new instrument or regenerate a report template
- Document what you learn. Most of the current knowledge lives only in the code.

---

## Minimum qualifications

These match the posting. The third column is for interviewers.

| Qualification | What we expect | Why it matters here |
|---|---|---|
| **Degree and experience** | BS in EE, CompE, or CS (or equivalent experience), 3+ years of related experience | Mid-level: works independently on most changes |
| **Python** | Proficient in scripting and application development | The whole app is Python |
| **Test equipment automation** | Has automated instruments, preferably with SCPI, VXI-11, GPIB, or PyVISA | The core of `connection.py`, and the basis for automating new testers |
| **Hand soldering** | Small surface-mount and through-hole parts, under a microscope when needed | Setting up abnormal/fault conditions |
| **Git and SQL** | Git: branch, commit, merge. SQL: `SELECT` with `WHERE`/`JOIN`/`GROUP BY`, `INSERT`/`UPDATE`, simple schema design, transactions, **parameterized queries** from Python | Source is on GitLab. SQL is for the planned SQLite move (see [SQL roadmap](#sql-roadmap)). |
| **Basic networking** | IP address vs port, TCP connections, timeouts, common connection errors | Every instrument sits on the lab network |
| **Communication** | Excellent written and verbal communication | Works between test engineers, developers, and certification reports |

## Preferred qualifications

| Qualification | Why it matters here |
|---|---|
| **IEC 62368-1 and product safety compliance testing** | The first responsibility is performing these tests |
| **Lab instruments:** oscilloscopes, multimeters, programmable power supplies, and safety testers (hipot, ground bond, touch current) | Daily lab work, and the instruments to automate next |
| **High-voltage lab safety practices** | Dielectric withstand testing |
| **AI coding agents** (e.g., Codex, GitHub Copilot, Cursor), with rigorous review of generated code | Team tooling responsibility |
| **Building AI skills or tools for a team** | Team tooling responsibility |
| **GUI development**, ideally Tkinter/ttk | ~35% of the codebase |
| **Data visualization** with matplotlib | Live results window, SVG export |
| **Network programming:** sockets, partial responses, retry and reconnect | The chart recorder and Prologix code use raw sockets |
| **Automated testing** with pytest, mocking or simulating hardware | Simulators responsibility |
| **XML processing** (lxml, XPath) or generating Word/Office documents | Report generator, ~20% of the codebase |

## Technical depth to probe in interviews

These topics came out of the code review. Each one is behind at least one real bug, so they
make good interview questions.

| Topic | What a strong candidate knows | Where it shows up |
|---|---|---|
| **Closures and late binding** | Why `lambda: f(i)` inside a loop sees the last `i`, and the `lambda i=i:` fix | Bugs #1 and #2 |
| **Truthiness and return contracts** | A non-empty tuple like `(False, "error")` is *true* | Bug #14: thermal tests continue after the voltage failed to set |
| **Exceptions and cleanup** | `try/finally` to reset state such as a "test in progress" flag | Bug #16 |
| **Event loops** | Why long tasks freeze a GUI. `root.update()` busy-waits vs `after()` vs worker threads. Re-entrancy. | All test procedures |
| **Escaping** | XML escaping and SQL parameterization are the same idea | Bug #6, and the SQL roadmap |
| **Serialization security** | Why `pickle.load` and `eval` on user files are dangerous | Project save/load |
| **Ambient correction** | `T_reported = T_measured + (T_ma − T_ambient)`, and why the same Tma must be used everywhere | The three-ambient-values issue |
| **Stability detection** | Rolling windows, plateau criteria, timeouts | `isStable5min`, `isStable30min` |
| **Office Open XML** | A `.docx` is a zip of XML; `w:tbl`, `w:tr`, `w:tc`, `w:gridSpan` | Report generator |
| **Vendored code** | Upgrade rather than patch; keep license notices | `libs/vxi11` (python-vxi11, MIT) |

---

## What makes this role challenging

- **Two jobs in one.** Lab schedules and software work compete for time. Agree on the
  split with the manager up front.
- **High voltage.** Dielectric withstand tests run at thousands of volts, and AutoTherm
  switches real power outputs. Safety training comes before any automation of these tests.
- **Hardware in the loop.** Much of the code can only be fully tested with lab equipment,
  so simulators are a priority.
- **Several protocols in one app.** Raw TCP, GPIB via Prologix, VXI-11/SCPI (itself built
  on Sun RPC), a proprietary ASCII protocol, and HTTP/JSON, each with its own error behavior.
- **Long tests on the GUI thread.** A thermal test can run for up to 3 hours inside a
  button-click handler. If an unexpected exception escapes, the "test in progress" flag
  can stay stuck until the app is restarted.
- **Legacy patterns.** Module-level global state, `from x import *`, imports whose order
  matters (Tk variables must be created after the root window exists), and duplicated code.
- **Template-coupled document generation.** The report code finds table cells by position
  (for example `w:tr[14]/w:tc[1]`, or even `w:p[1]/w:r[4]/w:t[1]`). Editing a Word
  template can break the code without any warning. See the [template row map](#appendix-report-template-row-map).
- **Compliance-relevant logic.** Pass/fail criteria, voltage limits, and the "Mark as
  complete" override need sign-off from the lab's test engineering lead.

---

## First 90 days

| When | Goal |
|---|---|
| **Weeks 1–2** | Complete lab safety training, including high voltage. Shadow each test type. Run AutoTherm from source without hardware, and map the `projectVars['tests']` data structure. |
| **Weeks 3–4** | Perform tests under supervision. Fix the ⚠️ bugs that can affect results (#14, #15, #16, #5), each with a regression test. |
| **Month 2** | Build simulators for the power source, power meter, and chart recorder, so a whole test runs at a desk. Take the [three-ambient-values issue](#items-that-need-lab-lead-sign-off) to the lab lead and implement the decision. |
| **Month 3** | Write a proposal for automating dielectric withstand, touch current, and ground bond tests (instruments, interfaces, report tables). Draft the SQLite schema. Produce a release build with PyInstaller. |

## Known issues backlog (found during code review)

These are real issues, found by reading the code (not yet reproduced on hardware).
⚠️ means it can affect test results or equipment, so fix those first and have the fix
reviewed by the lab's test engineering lead. The last column doubles as an interview topic.

| # | File | Issue | Skill involved |
|---|---|---|---|
| 1 | `libs/test_config.py` `drawTests`, `drawAbnormals` | The "X" (remove) buttons use `lambda: removeTest(..., i)` without binding `i`, so **every X button removes the last row** | Closures and late binding |
| 2 | `libs/test_config.py` ~line 500 | The PSU-name trace binds `i` but not `psuConfig`, so renaming a PSU can put the **last** PSU's name on the tab | Closures |
| 3 | `libs/test_config.py` ~line 190 | Uses `cfg` instead of `deleted_cfg`. Deleting a configuration can crash with `UnboundLocalError` or check the wrong data. | Reading loops carefully, variable scope |
| 4 | `libs/test_config.py` `saveTestConfig` | The Yes/No handling of the "completed tests will be overwritten" prompt looks inverted. Choosing "Yes, continue" leaves the window open. | Control flow, UX testing |
| 5 ⚠️ | `libs/table_logic.py` `createThermalTestTableXML` | `thermals[col_i % 2]` is always `thermals[0]` because `col_i` steps by 2. With more than one thermal test, **every column header shows the first test's voltage and ambient**. Probably meant `col_i // 2`. | Index arithmetic |
| 6 | `libs/table_logic.py` (all `etree.fromstring(f"...<w:t>{text}</w:t>...")`) | User text is inserted into XML without escaping. A system name like `R&D Rack` makes the **export fail**. | XML escaping, building elements safely |
| 7 | `libs/xml_helper_functions.py`, `libs/table_logic.py` | `os.path.dirname(...)[2:]` removes a Windows drive letter but **cuts `/U` off `/Users/...` on macOS** | Cross-platform paths, `pathlib` |
| 8 | `libs/connection.py` `setDPMMode` | `net_dpm[i].write(":INPut:MODE {mode}")` is missing the `f` prefix, so it sends the literal text `{mode}` | f-strings, checking instrument responses |
| 9 | `libs/connection.py` `powerSupplyOn` | `out` is undefined if all three reads fail (crash), and the loop doesn't stop early on success | Retry loops, error handling |
| 10 | `libs/connection.py` `DPMReadings` | Returns a list on success but a `(None, msg)` tuple on failure. See #16 for the effect. | Consistent return types, exceptions |
| 11 | `libs/connection.py` `NetworkDPMSInitialConnect` | `all_ok` is overwritten on each loop, so only the last meter's result counts | Combining boolean results |
| 12 | `AutoTherm.py` `saveProject` | Autosave filename uses `strftime('%y/%m/%d %H:%M:%S')`. The slashes become folders, and colons aren't allowed on Windows. | File naming, cross-platform behavior |
| 13 | `AutoTherm.py` `exportDatasheet` | The save dialog is inside the per-PSU loop | Indentation and loop structure |
| 14 ⚠️ | `libs/test_scripts.py` `runThermalTest` | `if not (setF(f) and setV(V, ...)): return False`. Both functions return a tuple like `(False, "msg")`, and **a non-empty tuple is always true**, so a thermal test continues even if the voltage or frequency couldn't be set. The input test does this correctly with `result[0]`. | Truthiness, API contracts |
| 15 ⚠️ | `libs/test_scripts.py` `runThermalTest` | Calls `setF(f)` even for DC tests, where `f = 0`. That sends `FREQ 0` / `FSET 0`, then divides by zero inside `setF` and retries 5 times (about 5 seconds wasted). The input test skips `setF` when `f == 0`. | Treating AC and DC consistently |
| 16 | `libs/test_scripts.py` `runInputTest` | Checks `if dr == None`, but `DPMReadings` returns `(None, msg)` on failure, so the next line crashes. Because the exception escapes `runIndividualTest`, **`test_in_progress` stays `True`** and every later test says "Another test is already running" until restart. | Exceptions and cleanup (`try/finally`) |
| 17 | `libs/test_scripts.py` `runInputTest` | `test_dict["power_vals"] = [a[-1] for a in I]` stores **current** where power belongs (should be `P`). It's corrected only if the test completes, so an aborted or failed test leaves current values in the power field. | Careful copy-paste review |
| 18 | `libs/test_scripts.py` `runThermalTest` | If no matching input result is found (`PM` is `None`), it sets a status but doesn't return. `sum(PM)` then crashes (see #16 for the stuck flag). | Guard clauses |
| 19 | `libs/results.py` | `ambient_max` (used for the CSV "interp" column) is only updated when the user edits the ambient field. After **loading a project**, CSV exports use the default 40 °C, not the project's value. | Global state synchronization |

## Items that need lab-lead sign-off

These are decisions, not just code fixes. Bring a proposal to the lab's test engineering lead.

- **Three different "manufacturer ambient" values.** During a test, `test_scripts.py`
  adjusts temperatures to `Tmax[0]`, which `test_config.py` hard-codes to **55 °C**. The Word
  report uses the project's *Mfg Ambient* field (default 40 °C). The CSV export uses
  `results.ambient_max`, which goes stale (#19). So pass/fail during the test, the report,
  and the CSV can be computed at different ambients. A test engineer needs to decide
  which one is correct.
- **"Mark as complete" override** (`results.markTestComplete`). This can mark a thermal or
  abnormal test *Completed* with partial data, and no record is kept of who did it or why.
  Ask what the lab's quality process requires.
- **Re-entrancy during tests.** While a test runs, `root.update()` keeps the whole GUI
  clickable. "Load Project" or "Configure Tests" can then replace the data structure the
  running test is writing to.
- `libs/tkinter_file_io.py` loads project files with `pickle.load` and then calls `eval()`
  on strings that contain `Var(value=`. **Opening an untrusted `.aut` or `.acs` file can
  run arbitrary code**, and user text that happens to contain `"""` or `Var(value=` breaks
  loading. Changing the file format needs a migration plan.
- The overvoltage guard in `setV` (`if acv + Vset >= 454`) compares values that don't
  obviously add up to the combined AC+DC output. It needs review by an engineer who knows
  the PCR-WEA limits.
- `createDocxWithContent` overwrites the template's own `document.xml` and writes temp
  files to the current directory. That can fail in read-only install folders, and two
  exports can collide.
- Exporting changes stored results: `test['ambient']` is replaced with the manual value
  during export.
- **Vendored `vxi11`**: its regex uses `'\d'` in a non-raw string. That's a
  `DeprecationWarning` today and a `SyntaxWarning` from Python 3.12. It's also 10-second
  VXI-11 timeouts that freeze the GUI while waiting. Plan to upgrade the library rather
  than patching it in place.

---

## SQL roadmap

SQL is a **required** skill even though the current code has no database. It's there
because of where the tool needs to go. A database would fix several problems found in
review:

| Problem today | How SQL helps |
|---|---|
| Projects are saved with `pickle` plus `eval`, so opening an untrusted file can run code | SQLite stores plain data. Reading it never runs code. |
| Results live in one file per project, so you can't compare PSUs or search across projects | One database, queryable with SQL. For example: the highest temperature per component across all 2026 tests. |
| "Mark as complete" leaves no record of who did it or why | An audit table records who changed what, and when |
| The ambient value is stored in several places and can disagree | One `projects` row holds the manufacturer ambient, and everything reads it from there |
| Every 5-second thermal sample is kept only in memory until the next save | Write each sample to a `readings` table as it's taken, so a crash doesn't lose the test |

A possible starting schema: `projects`, `psus`, `configurations`, `tests`
(input/thermal/abnormal), `channels`, `readings` (time, channel, temperature, power), and
`audit_log`. Python's built-in `sqlite3` module means there's no server to install, and it
works inside a PyInstaller build.

**Suggested order:** add the audit table and write each reading to SQLite as it's taken,
then build a one-way export from existing `.aut` files. Switch save/load from pickle to
SQLite last, with a migration plan so old projects still open.

---

## Tech stack

**Language:** Python 3.10+
**GUI:** Tkinter / ttk; matplotlib (`FigureCanvasTkAgg`, `FuncAnimation`) for live temperature charts
**Instrument I/O:** `socket` (raw TCP), Prologix GPIB-Ethernet, vendored `python-vxi11` (MIT; VXI-11 over ONC/Sun RPC), SCPI, Yokogawa ASCII protocol, `requests` (HTTP/JSON)
**Documents:** lxml, XPath, `xml.dom.minidom`, `zipfile` (hand-built `.docx` from OOXML templates); `csv`; SVG chart export
**Persistence:** `pickle` plus a custom Tk-variable serializer (`.aut` projects, `.acs` connection settings). Planned: SQLite (see [SQL roadmap](#sql-roadmap))
**Build:** PyInstaller (Windows onedir, macOS onefile)
**Source control:** Git / GitLab
**Hardware:** Kikusui AC/DC power sources, Yokogawa WT310E power meters (×1–4), Yokogawa chart recorder (Type T thermocouples, up to 100 channels), networked temperature/humidity sensor
**Standards:** IEC 62368-1, IEC 60950-1 (legacy clause references in the templates)

---

## Skill weighting (how the work time splits)

Based on the code reviewed so far (about 95% of the Python source):

| Area | Share of codebase | Ramp-up difficulty |
|---|---|---|
| Tkinter GUI and state management | ~35% | Medium: lots of code, but patterns repeat |
| Instrument communication | ~25% | **High:** protocols, hardware, safety |
| Word report generation (OOXML) | ~20% | **High:** unusual skill, fragile coupling to templates |
| Test procedures and pass/fail logic | ~15% | **Medium to high:** the code is short, but you have to understand the domain |
| Save/load, exports, and packaging | ~5% | Low to medium, with a security caveat |

The vendored `vxi11` library (~1,200 lines with `rpc.py`) isn't counted. It's third-party
code you use but don't maintain.

---

## Appendix: Report template row map

The report code finds rows by **1-based position**. If you add, remove, or merge rows in a
template, update these indexes in `libs/table_logic.py`. After editing `templates/X.docx`,
regenerate `templates/X.xml` by running `libs/xml_helper_functions.py` from the `libs/`
folder (see its `__main__` block).

**`input.docx`** (8 rows, 1 table)

| Row | Contents | Filled by code |
|---|---|---|
| 1 | Clause refs (62368-1 B.2.5 / 60950-1 1.6.2), title | – |
| 2 | Headers: U (V), Hz, I (A), I rated (A), P (W), P rated (W), Fuse No, I fuse (A), Condition/status | – |
| 3 | **Template data row.** Copied once per completed input test, then removed. | V, Hz, I, I rated, P (P rated and fuse columns stay `--`) |
| 4 | Supplementary information | Configuration name |
| 5 | System | System name |
| 6 | PSU | PSU name |
| 7 | Fans | *not filled* |
| 8 | Date & Tested by / Equipment ID | Last test date and tester (cell 1); instrument IDs (cell 2) |

**`thermal.docx`** (18 rows, 1 table)

| Row | Contents | Filled by code |
|---|---|---|
| 1 | Clause refs, title "Temperature Measurements & Abnormal operating and fault condition tests" | – |
| 2 | Supply voltage | One column per thermal test (×2: Actual and Interp.) and per abnormal test. The width of cell 2 is split among them. |
| 3 | Ambient Tamb (°C) | Per column |
| 4 | Headers: T (°C), Tmax (°C) | – |
| 5 | Info type | "Actual", "Interp.", "Abnormal: …" |
| 6 | (blank) | Configuration name |
| 7 | **Template temperature row** | One row per thermocouple channel |
| 8 | "Touch Temperature of accessible parts at 25 °C" | – (touch rows are inserted after it) |
| 9 | **Template touch row** | One row per channel marked *Touch?* |
| 10 | %RH | Per column |
| 11 | Test Time (min) | Per column |
| 12 | Winding temperature (resistance method: t1, R1, t2, R2) | *Not automated* |
| 13 | Supplementary information | – |
| 14 | System | System name |
| 15 | PSU | PSU name |
| 16 | Fans | *not filled* |
| 17 | Tma note ("XXX°C using linear extrapolation") | Mfg ambient replaces **run 4** of paragraph 1 |
| 18 | Date & Tested by / Equipment ID | Last test date and tester; instrument IDs |

---

## Codebase coverage

| File | Reviewed | Notes |
|---|---|---|
| `AutoTherm.py` | ✅ v1 | Main window, test runner, save/load, export |
| `project_vars.py` | ✅ v1 | Shared project state |
| `AutoTherm.spec`, `README.md` | ✅ v1 | Build and changelog |
| `libs/connection.py` | ✅ v2 | All instrument I/O |
| `libs/test_config.py` | ✅ v2 | Test configuration window, tests generated from config |
| `libs/table_logic.py` | ✅ v2 | Word table builders |
| `libs/xml_helper_functions.py` | ✅ v2 | `.docx` assembly, docx→xml template tool |
| `libs/tkinter_file_io.py` | ✅ v2 | Serialization and deep copy of Tk variables |
| `libs/test_scripts.py` | ✅ v3 | Input and thermal/abnormal procedures, stability criteria, abort handling |
| `libs/results.py` | ✅ v3 | Live chart window, CSV/SVG export, manual "Mark as complete" |
| `libs/vxi11/vxi11.py` | ✅ v3 | Vendored python-vxi11 (MIT, Forencich and Walle) |
| `templates/input.docx`, `templates/thermal.docx` | ✅ v3 | Structure mapped in the appendix |
| `libs/vxi11/rpc.py` | ❌ | ONC RPC / XDR layer for vxi11 (third-party, low priority) |
| `templates/abnormal.docx`, `templates/empty_word_doc/` | ❌ | Abnormal table template, blank document shell |

---

## Revision history

| Version | Date | Change |
|---|---|---|
| 1 | 2026-09-23 | First assessment from `AutoTherm.py`, `project_vars.py`, `AutoTherm.spec`, `README.md` (shared in chat) |
| 2 | 2026-09-23 | Rewritten as a formal job description after reviewing five `libs/` modules. Added the specific instrument models and protocols. Raised OOXML/XPath to a core skill. Added serialization security, control-loop concepts, and a 13-item starter bug list. Confirmed the lambda late-binding hazard as live bugs. |
| 3 | 2026-09-23 | Reviewed `test_scripts.py`, `results.py`, `vxi11.py`, and two report templates. Confirmed the domain as IEC 62368-1 / 60950-1 report tables. Added test-procedure responsibilities, matplotlib-in-Tkinter, time-series and stability logic, truthiness, vendored-library handling, and ambient correction. Added bugs #14–19 and three new senior-review items (inconsistent ambient values, the manual-complete override, re-entrancy). Added the template row map. Updated the skill weighting. |
| 4 | 2026-09-23 | Added a candidate-facing job posting (`autotherm-junior-developer-job-posting.md`) built from the required and preferred qualifications. |
| 5 | 2026-09-24 | Made **SQL** a required qualification in both the internal description and the job posting. Added a responsibility and a SQL roadmap section that explains why: replacing pickle files, an audit trail, cross-project queries, and one place for the ambient value. |
| 6 | 2026-09-28 | Re-scoped to a mid-level **Safety Test and Automation Engineer** (hybrid lab testing and software). Renamed both files. Added safety-testing and automation-expansion responsibilities, aligned minimum and preferred qualifications with the new posting, added an interview-topics table, a mid-level 90-day plan, and lab-lead sign-off in place of senior-engineer escalation. |
