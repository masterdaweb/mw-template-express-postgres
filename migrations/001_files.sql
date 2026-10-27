-- The files the API keeps: the object in the bucket, described here.
CREATE TABLE files (
  id           bigserial PRIMARY KEY,
  object_key   text        NOT NULL UNIQUE,
  name         text        NOT NULL,
  size         bigint      NOT NULL,
  content_type text        NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);
