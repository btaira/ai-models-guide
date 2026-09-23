# Junior Software Developer, Test Automation (Python)

**Team:** [Hardware Compliance / Safety Test Engineering]
**Location:** [City, State] · [On-site / Hybrid]. Some work happens in a hardware test lab.
**Employment type:** [Full-time]
**Reports to:** [Hiring manager title]

> Fill in the bracketed fields before posting. This posting is based on the internal role
> description in [`autotherm-junior-developer-job-description.md`](autotherm-junior-developer-job-description.md).

---

## About the role

Our compliance lab tests power supplies to international electrical safety standards
(IEC 62368-1) before products can be certified and shipped. To do that, we built
**AutoTherm**, a Python desktop application that runs lab instruments automatically. It
controls a programmable power source, reads power meters and up to 100 temperature sensors,
decides when a test has passed or stabilized, and produces the tables that go into our
official certification reports.

We're looking for a junior developer to maintain and grow AutoTherm. You'll write Python
that talks to real lab equipment, and you'll work side by side with the test engineers
who use your software every day. You don't need a hardware background. If you know Python
fundamentals and like understanding how things work, we'll teach you the rest.

## What you'll do

- Fix bugs and build features in a Python / Tkinter desktop application
- Write and maintain code that communicates with lab instruments over the network
  (power sources, power meters, temperature recorders, environmental sensors)
- Maintain the logic that runs each test and decides pass, fail, or "stable"
- Maintain the generator that produces the Word report tables used in certification
  submissions
- Add automated tests and hardware simulators, so more of the code can be tested without
  lab equipment
- Package and release the application for Windows and macOS
- Help lab users troubleshoot connection and setup problems
- Improve documentation as you learn the system

## Required qualifications

- **Python 3 fundamentals:** functions, classes, exceptions, modules, dictionaries and lists,
  list comprehensions, and f-strings
- **A solid grasp of Python scope and closures,** including `global` vs local variables and
  how lambdas capture variables inside loops
- **Attention to detail with Python's behavior,** such as truthiness and consistent return
  values. Our software's results end up in certification reports, so small mistakes matter.
- **Comfort reading and debugging code you didn't write.** That means tracing data across
  several files, reproducing a bug before fixing it, and using logging or a debugger.
- **Working knowledge of Git:** branching, committing, merging, and writing clear commit messages
- **Basic networking knowledge:** IP addresses and ports, TCP connections, timeouts, and
  common connection errors
- **Clear communication:** you ask questions early and can explain a technical problem to
  someone who isn't a developer

## Preferred qualifications

You don't need all of these. We'll help you learn the ones you're missing.

- **GUI development,** ideally Tkinter/ttk (layouts, dialogs, widget variables, input
  validation), and an understanding of event loops and keeping a UI responsive during
  long-running work
- **Data visualization:** matplotlib, especially live-updating charts inside a desktop app
- **Time-series logic:** sampling loops, rolling windows, and detecting when a signal has
  stabilized
- **Network programming:** Python sockets, handling partial responses, and retry and
  reconnect logic
- **Instrument control or test automation:** SCPI, VXI-11, GPIB, PyVISA, or reading vendor
  programming manuals
- **XML processing:** lxml, XPath, and namespaces. Bonus if you know how Word (.docx)
  documents are structured internally.
- **Data formats and web APIs:** HTTP/JSON with `requests`, and CSV
- **Secure coding awareness:** the risks of `pickle` and `eval` on untrusted input, and
  safer alternatives such as JSON with schema validation
- **Working with third-party libraries** responsibly: dependency management, licensing,
  and upgrading rather than patching vendored code
- **Packaging and cross-platform development:** PyInstaller, and differences between
  Windows and macOS (file paths, permissions)
- **Automated testing:** `pytest`, and mocking or simulating hardware dependencies

## Nice to have

- Electronics basics: AC vs DC, voltage, current, power, frequency
- Exposure to product safety standards (IEC 62368-1 / 60950-1) or compliance testing
- Experience in a lab, manufacturing test, or hardware environment
- Electrical lab safety training (we'll provide this if needed)

## What you'll learn

- How professional test automation software controls real instruments safely
- How products are tested and certified for electrical safety
- How to turn a legacy codebase into a well-tested one
- How to work directly with the engineers who use your software

## What we offer

[Salary range] · [Benefits] · [Learning and development budget] · [Mentorship program]

---

*[Company] is an equal opportunity employer. [Insert standard EEO statement.]*
