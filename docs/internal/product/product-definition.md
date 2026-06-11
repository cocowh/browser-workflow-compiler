---
sidebar_position: 1
status: draft
last_updated: 2026-06-12
---

# Product Definition

## Product Name

Browser Workflow Compiler

## Definition

Browser Workflow Compiler turns a real browser operation into a structured workflow that can be explained, edited, replayed, and exported.

The system observes a user's interaction with a website, captures the browser and network evidence around that interaction, analyzes relationships between actions and requests, then generates a workflow representation that can be replayed or exported.

## Target Users

- QA engineers who need to turn manual web flows into repeatable tests or API-level checks.
- Platform engineers who need to understand hidden frontend-to-backend call chains.
- API governance teams that need to discover real API usage from browser behavior.
- Internal automation developers who need reliable workflow assets rather than fragile screen scripts.
- Engineers debugging complex web applications with many frontend requests, tokens, and state dependencies.

## Core User Jobs

### Understand a browser flow

The user wants to perform an action in a website and see what browser events and API calls happened behind the scenes.

### Turn a manual flow into a replayable workflow

The user wants to record a flow once, inspect it, correct it, then replay it without manually repeating every browser action.

### Extract API-level knowledge from frontend behavior

The user wants to understand endpoints, request bodies, response fields, tokens, cookies, and dependencies that are otherwise buried in a frontend application.

### Export useful artifacts

The user wants to export generated knowledge into formats such as Workflow IR, OpenAPI, Arazzo, Postman collections, or code.

## Core Value

- Preserve real evidence from user behavior.
- Connect user actions to network requests.
- Explain field dependencies across requests.
- Generate editable workflows instead of one-off scripts.
- Validate generated workflows through replay.
- Keep the user in control when analysis is uncertain.

## Non-positioning

This project is not:

- A generic packet capture tool.
- A crawler framework.
- A captcha bypass tool.
- An anti-bot evasion system.
- A fully autonomous browser agent in P0.
- A promise that any arbitrary website can be converted into a perfect API workflow automatically.

## Product Principles

### Evidence first

Raw observations and evidence should be preserved before interpretation.

### Replay before export

Generated workflows should be validated by replay before being treated as useful artifacts.

### Human correction is a feature

The user should be able to mark noise, rename steps, promote fields to variables, confirm dependencies, and reject unsafe generated steps.

### Local-first P0

The first version should run locally and avoid cloud complexity, multi-tenant permission systems, and remote data handling.

### LLMs assist, facts decide

LLMs can help explain, name, summarize, and propose repairs, but factual claims must be grounded in Observation IR, Evidence Graph, and replay results.
