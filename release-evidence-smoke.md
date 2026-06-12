# Release Evidence Smoke Test
**Target directory:** /work/hui/civilization3.0/projects/release-evidence-card-cli
**Entry command:** node --help
**Generated:** 2026-06-12

## Step 1: npm pack
- Tarball: release-evidence-card-cli-0.2.0.tgz
- Status: PASS

## Step 2: Install in temporary sandbox
- Sandbox: /work/hui/civilization3.0/projects/release-evidence-card-cli/tmp-smoke-1781282031665
- Status: PASS

## Step 3: Entry Smoke Test
- Command: node --help
- Status: PASS
- Output:
  Usage: node [options] [ script.js ] [arguments]
         node inspect [options] [ script.js | host:port ] [arguments]
  
  Options:
    -                           script read from stdin (default if no
                                file name is provided, interactive mode
                                if a tty)
    --                          indicate the end of node options
    --abort-on-uncaught-exception
                                aborting instead of exiting causes a
                                core file to be generated for analysis
    --build-snapshot            Generate a snapshot blob when the
                                process exits. Currently only supported
                                in the node_mksnapshot binary.
    -c, --check                 syntax check script without executing
    --completion-bash           print source-able bash completion
                                script
    -C, --conditions=...        additional user conditions for
                                conditional exports and imports
    --cpu-prof                  Start the V8 CPU profiler on start up,