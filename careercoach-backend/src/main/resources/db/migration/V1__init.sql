CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS cv_chunks (
    id BIGSERIAL PRIMARY KEY,
    cv_document_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    chunk_index INT NOT NULL,
    chunk_text TEXT NOT NULL,
    embedding vector(1536),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for vector similarity search (using HNSW index which is good for fast queries)
CREATE INDEX IF NOT EXISTS cv_chunks_embedding_idx ON cv_chunks USING hnsw (embedding vector_cosine_ops);
