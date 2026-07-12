-- Rename UserRole enum value DRIVER -> DISPATCHER (preserves existing rows)
ALTER TYPE "UserRole" RENAME VALUE 'DRIVER' TO 'DISPATCHER';
