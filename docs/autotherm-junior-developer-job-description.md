# Job Description: Junior Software Developer, AutoTherm (Test Automation)

> **Living document.** This is updated as more of the AutoTherm codebase is reviewed.
> See [Revision history](#revision-history) and [Codebase coverage](#codebase-coverage) at the bottom.

**Current version:** 2 (updated after reviewing `libs/connection.py`, `libs/test_config.py`,
`libs/table_logic.py`, `libs/tkinter_file_io.py`, `libs/xml_helper_functions.py`)

---

## About the role

AutoTherm is an internal Python desktop app used by a hardware compliance lab. It automates
**product safety testing of power supply units (PSUs)**. It:

1. Drives a programmable AC/DC power source to set voltages and frequencies
2. Reads up to four digital power meters and a multi-channel temperature chart recorder
3. Logs room temperature and humidity from a networked environmental sensor
4. Runs **input**, **thermal**, and **abnormal** (fault condition) tests
5. Generates the official **Word (.docx) datasheet** used as compliance evidence

You'll maintain and extend it: fix bugs, support new lab instruments, improve reliability,
and ship Windows and macOS builds. You'll work closely with test engineers who use the
tool every day.

This is a good role for a junior developer who wants to learn **software that touches
real hardware**. Expect a lot of mentoring. About half the work is ordinary Python, and
the other half is instruments, protocols, and document generation, which you'll learn on
the job.

---

## What you'll do

- Fix and improve the **Tkinter GUI**: main window, test configuration window (PSUs,
  up to 100 thermocouple channels, AC/DC test tables), connection settings window
- Maintain **instrument communication code** for:
  - Kikusui power sources: an older GPIB model (proprietary commands like `ACVSET`, `FSET`, `OUT ON`)
    and the networked PCR-WEA series (SCPI over VXI-11: `VOLT`, `VOLT:OFFS`, `FREQ`, `OUTP`)
  - Yokogawa WT310E digital power meters (SCPI: `:NUMeric:NORMal:VALue?`, `:INPut:MODE`)
  - A Yokogawa chart recorder with its own ASCII protocol (`_MFG`, `_INF`, `FData`, `EA…EN` framing, `E0`/`E1` status codes)
  - A Prologix GPIB-to-Ethernet adapter (`++mode`, `++addr`)
  - An environmental sensor with an HTTP/JSON endpoint (`/values.json`)
- Maintain the **datasheet generator**, which builds Word tables by editing Office Open XML
  (OOXML) directly with lxml and XPath, then zips the result into a `.docx`
- Maintain the **project save/load format** (`.aut` and `.acs` files)
- Build and release the app with **PyInstaller** for Windows and macOS
- Help lab users with connection problems (IP addresses, GPIB addresses, timeouts)
- Write down what you learn. Most of the current knowledge lives only in the code.

---

## Required qualifications

| Area | What we expect | Why it matters here |
|---|---|---|
| **Python 3** | Functions, classes, exceptions, modules, dicts and lists, f-strings, recursion | The whole app is Python. App state is one deeply nested dict and list tree. |
| **Python closures and scope** | Understand `global`, local vs module scope, and **late binding in lambdas** (`lambda i=i: ...`) | The GUI creates hundreds of buttons in loops. Getting this wrong is already a live bug in the codebase. |
| **Reading unfamiliar code** | Trace data through several modules that share global state | Two to three past authors, few comments, no tests |
| **Debugging** | Use print/log tracing and a debugger; reproduce a bug before fixing it | Many failures are silent (`except: pass`) |
| **Git** | Branch, commit, merge, and write readable commit messages | The source is hosted on GitLab |
| **Basic networking** | IP address vs port, TCP connection, timeouts, what "connection refused" means | Every instrument sits on the lab network |
| **Communication** | Ask clarifying questions and explain technical issues to non-developers | Your users are test engineers |

## Preferred qualifications (we'll help you learn these)

| Area | Details |
|---|---|
| **Tkinter / ttk** | `grid`/`pack`, `Notebook`, `Canvas`-based scrolling, `Toplevel` dialogs, `StringVar`/`IntVar`/`BooleanVar`, `trace_add`, `validatecommand` |
| **Event-driven GUI concepts** | The main loop, why long tasks freeze the UI, `root.update()` vs `after()` vs threads |
| **Socket programming** | `socket.socket`, `sendall`/`recv`, reading responses that arrive in pieces, retry and reconnect logic |
| **Instrument control** | SCPI basics (`*IDN?`, set vs query commands), VXI-11, GPIB addressing, reading vendor programming manuals |
| **XML and XPath** | lxml, namespaces, XPath with positional indexes (`w:tr[3]/w:tc[2]`), escaping text safely |
| **Office Open XML** | A `.docx` is a zip of XML. Word tables use `w:tbl`, `w:tr`, `w:tc`, `w:tcW` (width in twentieths of a point), `w:gridCol`, `w:gridSpan` |
| **HTTP/REST** | `requests.get(...).json()` with timeouts |
| **Serialization and security** | Why `pickle.load` and `eval` on user-supplied files are dangerous, and what to use instead (JSON plus a schema) |
| **Packaging** | PyInstaller (`.spec` files, `--hidden-import`, `--add-data`, onedir vs onefile), file paths inside frozen apps |
| **Cross-platform development** | Windows vs macOS paths, permissions, window sizing |
| **Automated testing** | `pytest`, and mocking hardware (fake instrument classes) so code can be tested without the lab |

## Nice to have

- Electronics basics: AC vs DC, RMS, voltage, current, power, frequency
- Some exposure to product safety standards (for example IEC 62368-1) and terms like
  *thermal test*, *abnormal test*, *manufacturer's rated ambient*, *touch temperature*
- Basic control-loop intuition: the voltage-setting routine is a simple feedback loop
  that nudges the setpoint until the power meter reads within 0.1% of target
- Experience in a lab or on a manufacturing test floor
- Electrical lab safety training. **This software switches real high-voltage outputs.**

---

## What makes this role challenging (read before applying)

- **Hardware in the loop.** Much of the code can only be fully tested with lab equipment.
  You'll learn to write simulators and mocks.
- **Several protocols in one app.** Raw TCP, GPIB via Prologix, VXI-11/SCPI, a proprietary
  ASCII protocol, and HTTP/JSON, each with its own error behavior.
- **Legacy patterns.** Module-level global state, `from x import *`, imports whose order
  matters (Tk variables must be created after the root window exists), and duplicated code.
- **Template-coupled document generation.** The datasheet code finds table cells by
  position (for example `w:tr[14]/w:tc[1]`). Editing the Word template in Word can break
  the code without any warning.
- **Safety-relevant logic.** Voltage limits, output on/off, and AC/DC switching need
  careful review with an engineer.

---

## Your first 90 days

| When | Goal |
|---|---|
| **Weeks 1–2** | Set up the environment. Run AutoTherm from source with no hardware. Read `AutoTherm.py` and `project_vars.py`. Draw the `projectVars['tests']` data structure on paper. |
| **Weeks 3–4** | Fix your first bugs from the starter list below. Learn Tkinter and closures properly (TkDocs.com). |
| **Month 2** | Read `connection.py` next to the Kikusui and Yokogawa manuals. Shadow a full thermal test in the lab. Write a fake power meter or fake chart recorder class. |
| **Month 3** | Take on the datasheet generator (`table_logic.py`): unzip a `.docx`, read its XML, and fix a table bug. Produce a release build with PyInstaller. |

### Starter bug list (found during code review)

These are real issues, suitable for learning. Each one teaches a specific skill.

| # | File | Issue | Skill it teaches |
|---|---|---|---|
| 1 | `libs/test_config.py` `drawTests`, `drawAbnormals` | The "X" (remove) buttons use `lambda: removeTest(..., i)` without binding `i`, so **every X button removes the last row** | Closures and late binding |
| 2 | `libs/test_config.py` ~line 500 | The PSU-name trace binds `i` but not `psuConfig`, so renaming a PSU can put the **last** PSU's name on the tab | Closures |
| 3 | `libs/test_config.py` ~line 190 | Uses `cfg` instead of `deleted_cfg`. Deleting a configuration can crash with `UnboundLocalError` or check the wrong data. | Reading loops carefully, variable scope |
| 4 | `libs/test_config.py` `saveTestConfig` | The Yes/No handling of the "completed tests will be overwritten" prompt looks inverted. Choosing "Yes, continue" leaves the window open. | Control flow, UX testing |
| 5 | `libs/table_logic.py` `createThermalTestTableXML` | `thermals[col_i % 2]` is always `thermals[0]` because `col_i` steps by 2. With more than one thermal test, **every column header shows the first test's voltage and ambient**. Probably meant `col_i // 2`. | Index arithmetic |
| 6 | `libs/table_logic.py` (all `etree.fromstring(f"...<w:t>{text}</w:t>...")`) | User text is inserted into XML without escaping. A system name like `R&D Rack` makes the **export fail**. | XML escaping, building elements safely |
| 7 | `libs/xml_helper_functions.py`, `libs/table_logic.py` | `os.path.dirname(...)[2:]` removes a Windows drive letter but **cuts `/U` off `/Users/...` on macOS** | Cross-platform paths, `pathlib` |
| 8 | `libs/connection.py` `setDPMMode` | `net_dpm[i].write(":INPut:MODE {mode}")` is missing the `f` prefix, so it sends the literal text `{mode}` | f-strings, checking instrument responses |
| 9 | `libs/connection.py` `powerSupplyOn` | `out` is undefined if all three reads fail (crash), and the loop doesn't stop early on success | Retry loops, error handling |
| 10 | `libs/connection.py` `DPMReadings` | Returns a list on success but a `(None, msg)` tuple on failure, so callers crash on `[0][0]` | Consistent return types, exceptions |
| 11 | `libs/connection.py` `NetworkDPMSInitialConnect` | `all_ok` is overwritten on each loop, so only the last meter's result counts | Combining boolean results |
| 12 | `AutoTherm.py` `saveProject` | Autosave filename uses `strftime('%y/%m/%d %H:%M:%S')`. The slashes become folders, and colons aren't allowed on Windows. | File naming, cross-platform behavior |
| 13 | `AutoTherm.py` `exportDatasheet` | The save dialog is inside the per-PSU loop | Indentation and loop structure |

### Things to raise with a senior engineer (don't fix alone)

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

---

## Tech stack

**Language:** Python 3.10+
**GUI:** Tkinter / ttk, matplotlib (result plots)
**Instrument I/O:** `socket` (raw TCP), Prologix GPIB-Ethernet, `vxi11` (vendored), SCPI, Yokogawa ASCII protocol, `requests` (HTTP/JSON)
**Documents:** lxml, XPath, `xml.dom.minidom`, `zipfile` (hand-built `.docx` from OOXML templates)
**Persistence:** `pickle` plus a custom Tk-variable serializer (`.aut` projects, `.acs` connection settings)
**Build:** PyInstaller (Windows onedir, macOS onefile)
**Source control:** Git / GitLab
**Hardware:** Kikusui AC/DC power sources, Yokogawa WT310E power meters (×1–4), Yokogawa chart recorder (thermocouples, up to 100 channels), networked temperature/humidity sensor

---

## Skill weighting (how the work time splits)

Based on the code reviewed so far:

| Area | Share of codebase | Difficulty for a junior |
|---|---|---|
| Tkinter GUI and state management | ~40% | Medium: lots of code, but patterns repeat |
| Instrument communication | ~25% | **High:** protocols, hardware, safety |
| Word datasheet generation (OOXML) | ~20% | **High:** unusual skill, fragile coupling to templates |
| Test orchestration logic | ~10% | Medium (`test_scripts.py` not yet reviewed) |
| Save/load and packaging | ~5% | Low to medium, with a security caveat |

---

## Codebase coverage

Files reviewed so far, and what's still unknown:

| File | Reviewed | Notes |
|---|---|---|
| `AutoTherm.py` | ✅ | Main window, test runner, save/load, export |
| `project_vars.py` | ✅ | Shared project state |
| `AutoTherm.spec`, `README.md` | ✅ | Build and changelog |
| `libs/connection.py` | ✅ | All instrument I/O |
| `libs/test_config.py` | ✅ | Test configuration window, tests generated from config |
| `libs/table_logic.py` | ✅ | Word table builders |
| `libs/xml_helper_functions.py` | ✅ | `.docx` assembly |
| `libs/tkinter_file_io.py` | ✅ | Serialization and deep copy of Tk variables |
| `libs/test_scripts.py` | ❌ | Input and thermal test procedures, abort handling, sampling loop |
| `libs/results.py` | ❌ | Results viewer, matplotlib plots, ambient-max logic |
| `libs/vxi11/` | ❌ | Probably the vendored python-vxi11 library |
| `libs/templates/` | ❌ | Word templates (`input.xml`, `thermal.xml`, `abnormal.xml`, `empty_word_doc/`) |

---

## Revision history

| Version | Date | Change |
|---|---|---|
| 1 | 2026-09-23 | First assessment from `AutoTherm.py`, `project_vars.py`, `AutoTherm.spec`, `README.md` (shared in chat) |
| 2 | 2026-09-23 | Rewritten as a formal job description after reviewing five `libs/` modules. Added the specific instrument models and protocols. Raised OOXML/XPath to a core skill. Added serialization security, control-loop concepts, and a 13-item starter bug list. Confirmed the lambda late-binding hazard as live bugs. |
