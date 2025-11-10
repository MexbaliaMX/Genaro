# Compliance Prompt Pack

Store regulatory monitoring prompts, policy summarization templates, and directive scaffolds used by the Regulatory Watchdog Agent.

## Usage
- Capture source citations, jurisdiction tags, and effective dates inside each prompt to streamline downstream acknowledgements.
- Note expected runtime context (e.g., scheduler poller, legal inbox triage) at the top of every prompt file.
- Mirror naming conventions from active directives so agents can retrieve the correct template programmatically.

## Maintenance
- Update prompts whenever IntegrationLayer feeds or external policy trackers change structure.
- Coordinate revisions with legal and compliance stakeholders before publication.
- Maintain a changelog to support audits; reference entries from `regulatory-watchdog-agent.md` when directives evolve.
