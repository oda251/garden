#!/bin/bash
set -euo pipefail

LOG_FILE="${CLAUDE_PROJECT_DIR:-.}/.claude/agent-activity.jsonl"
INPUT=$(cat)

EVENT=$(echo "$INPUT" | jq -r '.hook_event_name')
AGENT_ID=$(echo "$INPUT" | jq -r '.agent_id // empty')
AGENT_TYPE=$(echo "$INPUT" | jq -r '.agent_type // empty')
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

if [ "$EVENT" = "SubagentStart" ]; then
  jq -n \
    --arg ts "$TIMESTAMP" \
    --arg event "start" \
    --arg id "$AGENT_ID" \
    --arg type "$AGENT_TYPE" \
    '{timestamp: $ts, event: $event, agent_id: $id, agent_type: $type}' \
    >> "$LOG_FILE"

elif [ "$EVENT" = "SubagentStop" ]; then
  TRANSCRIPT_PATH=$(echo "$INPUT" | jq -r '.agent_transcript_path // empty')

  # transcript JSONL からトークン数を集計
  TOTAL_TOKENS=0
  if [ -n "$TRANSCRIPT_PATH" ] && [ -f "$TRANSCRIPT_PATH" ]; then
    TOTAL_TOKENS=$(jq -s '[.[].usage.total_tokens // 0] | add' "$TRANSCRIPT_PATH" 2>/dev/null || echo 0)
  fi

  jq -n \
    --arg ts "$TIMESTAMP" \
    --arg event "stop" \
    --arg id "$AGENT_ID" \
    --arg type "$AGENT_TYPE" \
    --argjson tokens "$TOTAL_TOKENS" \
    '{timestamp: $ts, event: $event, agent_id: $id, agent_type: $type, total_tokens: $tokens}' \
    >> "$LOG_FILE"
fi

exit 0
