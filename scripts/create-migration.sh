#!/usr/bin/bash
read -p "Enter migration name: " NAME
echo 'import type { Kysely } from "kysely";

export const up = async (db: Kysely<any>) => {};
export const down = async (db: Kysely<any>) => {};
' > "./db/migrations/$(date -u +"%Y%m%dT%H%M%SZ")_$NAME.ts"
