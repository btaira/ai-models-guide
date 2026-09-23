# Job Description: Junior Software Developer, AutoTherm (Test Automation)

> **Living document.** This is updated as more of the AutoTherm codebase is reviewed.
> See [Revision history](#revision-history) and [Codebase coverage](#codebase-coverage) at the bottom.
> A candidate-facing version for posting is in
> [`autotherm-junior-developer-job-posting.md`](autotherm-junior-developer-job-posting.md).
> Keep the two in sync when qualifications change.

**Current version:** 3 (updated after reviewing `libs/test_scripts.py`, `libs/results.py`,
`libs/vxi11/vxi11.py`, and the `input.docx` / `thermal.docx` report templates)

---

## About the role

AutoTherm is an internal Python desktop app used by a hardware compliance lab. It automates
**product safety testing of power supply units (PSUs)** under **IEC 62368-1** (and the older
IEC 60950-1). It:

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

You'll maintain and extend it: fix bugs, support new lab instruments, improve reliability,
and ship Windows and macOS builds. You'll work closely with test engineers who use the
tool every day. **The numbers this software produces end up in certification paperwork,
so correctness matters more than speed.**

This is a good role for a junior developer who wants to learn **software that touches
real hardware**. Expect a lot of mentoring. About half the work is ordinary Python, and
the other half is instruments, test logic, and document generation, which you'll learn on
the job.

---

## What you'll do

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
- Maintain **exports**: CSV test logs and SVG charts from the results window
- Maintain the **project save/load format** (`.aut` and `.acs` files)
- Build and release the app with **PyInstaller** for Windows and macOS
- Help lab users with connection problems (IP addresses, GPIB addresses, timeouts)
- Write down what you learn. Most of the current knowledge lives only in the code.

---

## Required qualifications

| Area | What we expect | Why it matters here |
|---|---|---|
| **Python 3** | Functions, classes, exceptions, modules, dicts and lists, list comprehensions, f-strings, recursion | The whole app is Python. App state is one deeply nested dict and list tree. |
| **Python closures and scope** | Understand `global`, local vs module scope, and **late binding in lambdas** (`lambda i=i: ...`) | The GUI creates hundreds of buttons in loops. Getting this wrong is already a live bug in the codebase. |
| **Python truthiness** | Know that a non-empty tuple like `(False, "error")` is *true* | This mistake currently lets thermal tests continue after the voltage failed to set |
| **Reading unfamiliar code** | Trace data through several modules that share global state | Two to three past authors, few comments, no tests |
| **Debugging** | Use print/log tracing and a debugger; reproduce a bug before fixing it | Many failures are silent (`except: pass`) |
| **Git** | Branch, commit, merge, and write readable commit messages | The source is hosted on GitLab |
| **Basic networking** | IP address vs port, TCP connection, timeouts, what "connection refused" means | Every instrument sits on the lab network |
| **Communication** | Ask clarifying questions and explain technical issues to non-developers | Your users are test engineers |

## Preferred qualifications (we'll help you learn these)

| Area | Details |
|---|---|
| **Tkinter / ttk** | `grid`/`pack`, `Notebook`, `Canvas`-based scrolling, `Toplevel` and `grab_set` (modal) dialogs, `StringVar`/`IntVar`/`BooleanVar`, `trace_add`, `validatecommand` |
| **Event-driven GUI concepts** | The main loop. Why AutoTherm's long tests run *on* the GUI thread and keep the window alive with busy-wait `root.update()` loops. Re-entrancy (the user can click other buttons mid-test). Alternatives: `after()`, worker threads, queues. |
| **matplotlib in Tkinter** | `FigureCanvasTkAgg`, `FuncAnimation` (and why the animation object must be kept in a variable so it isn't garbage-collected), SVG export, and why PyInstaller needs `--hidden-import matplotlib.backends.backend_svg` |
| **Time-series / sampling logic** | Sampling loops, rolling windows (`x[-10:]`), stability and plateau detection, timeouts |
| **Socket programming** | `socket.socket`, `sendall`/`recv`, reading responses that arrive in pieces, retry and reconnect logic |
| **Instrument control** | SCPI basics (`*IDN?`, set vs query commands), VXI-11, GPIB addressing, reading vendor programming manuals |
| **XML and XPath** | lxml, namespaces, XPath with positional indexes (`w:tr[3]/w:tc[2]`), escaping text safely |
| **Office Open XML** | A `.docx` is a zip of XML. Word tables use `w:tbl`, `w:tr`, `w:tc`, `w:tcW` (width in twentieths of a point), `w:gridCol`, `w:gridSpan` |
| **HTTP/REST and CSV** | `requests.get(...).json()` with timeouts; the `csv` module |
| **Serialization and security** | Why `pickle.load` and `eval` on user-supplied files are dangerous, and what to use instead (JSON plus a schema) |
| **Third-party vendored code** | `libs/vxi11` is a copied-in MIT-licensed library (python-vxi11). Know not to edit it locally, keep its license notice, and when to replace it with the pip package or PyVISA-py. |
| **Packaging** | PyInstaller (`.spec` files, `--hidden-import`, `--add-data`, onedir vs onefile), file paths inside frozen apps |
| **Cross-platform development** | Windows vs macOS paths, permissions, window sizing |
| **Automated testing** | `pytest`, and mocking hardware (fake instrument classes) so code can be tested without the lab. The stability functions (`isStable5min`, `isStable30min`) are pure functions and a good first thing to unit test. |

## Nice to have

- Electronics basics: AC vs DC, RMS, voltage, current, power, frequency, rated current
- Some exposure to **IEC 62368-1** or **IEC 60950-1**, or to CB-scheme test report forms
  (TRFs). Know terms like *input test*, *thermal test*, *abnormal operating and fault
  condition test*, *manufacturer's declared ambient (Tma)*, *touch temperature*,
  *steady state*, *thermocouple (Type T)*.
- Understand **linear ambient correction**: `T_reported = T_measured + (T_ma − T_ambient)`.
  AutoTherm uses this in stability checks, in limit checks, and in the report's "Interp." column.
- Basic control-loop intuition: the voltage-setting routine is a simple feedback loop
  that nudges the setpoint until the power meter reads within 0.1% of target
- Experience in a lab or on a manufacturing test floor
- Electrical lab safety training. **This software switches real high-voltage outputs.**

---

## What makes this role challenging (read before applying)

- **Hardware in the loop.** Much of the code can only be fully tested with lab equipment.
  You'll learn to write simulators and mocks.
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
- **Safety- and compliance-relevant logic.** Voltage limits, output on/off, AC/DC
  switching, pass/fail criteria, and the "Mark as complete" manual override all need
  careful review with an engineer.

---

## Your first 90 days

| When | Goal |
|---|---|
| **Weeks 1–2** | Set up the environment. Run AutoTherm from source with no hardware. Read `AutoTherm.py` and `project_vars.py`. Draw the `projectVars['tests']` data structure on paper. Unzip `input.docx` and look at `word/document.xml`. |
| **Weeks 3–4** | Fix your first bugs from the starter list below. Learn Tkinter and closures properly (TkDocs.com). Write `pytest` tests for `isStable5min` / `isStable30min` using made-up temperature data. |
| **Month 2** | Read `connection.py` and `test_scripts.py` next to the Kikusui and Yokogawa manuals. Shadow a full thermal test in the lab. Write a fake power meter and fake chart recorder so a whole test can run at your desk. |
| **Month 3** | Take on the report generator (`table_logic.py`): change a `.docx` template, regenerate its XML with `xml_helper_functions.py`, and update the XPath indexes. Produce a release build with PyInstaller. |

### Starter bug list (found during code review)

These are real issues, found by reading the code (not yet reproduced on hardware). Each
one teaches a specific skill. ⚠️ means it can affect test results or equipment, so pair
with a senior engineer.

| # | File | Issue | Skill it teaches |
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

### Things to raise with a senior engineer (don't fix alone)

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

## Tech stack

**Language:** Python 3.10+
**GUI:** Tkinter / ttk; matplotlib (`FigureCanvasTkAgg`, `FuncAnimation`) for live temperature charts
**Instrument I/O:** `socket` (raw TCP), Prologix GPIB-Ethernet, vendored `python-vxi11` (MIT; VXI-11 over ONC/Sun RPC), SCPI, Yokogawa ASCII protocol, `requests` (HTTP/JSON)
**Documents:** lxml, XPath, `xml.dom.minidom`, `zipfile` (hand-built `.docx` from OOXML templates); `csv`; SVG chart export
**Persistence:** `pickle` plus a custom Tk-variable serializer (`.aut` projects, `.acs` connection settings)
**Build:** PyInstaller (Windows onedir, macOS onefile)
**Source control:** Git / GitLab
**Hardware:** Kikusui AC/DC power sources, Yokogawa WT310E power meters (×1–4), Yokogawa chart recorder (Type T thermocouples, up to 100 channels), networked temperature/humidity sensor
**Standards:** IEC 62368-1, IEC 60950-1 (legacy clause references in the templates)

---

## Skill weighting (how the work time splits)

Based on the code reviewed so far (about 95% of the Python source):

| Area | Share of codebase | Difficulty for a junior |
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
