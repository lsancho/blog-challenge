SET TIMEZONE = 'UTC';

CREATE SCHEMA IF NOT EXISTS blog;
--DROP SCHEMA IF EXISTS BLOG CASCADE;


-- User table creation
CREATE TABLE blog.user
(
    id         INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    public_id  VARCHAR(12)  NOT NULL,
    name       VARCHAR(100) NOT NULL,
    email      TEXT         NOT NULL UNIQUE,
    password   VARCHAR(100) NOT NULL,
    claims     JSONB        NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Post table creation
CREATE TABLE blog.post
(
    id         INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    public_id  VARCHAR(12)  NOT NULL,
    user_id    INT REFERENCES blog.user (id),
    version    INT          NOT NULL,
    title      VARCHAR(255) NOT NULL,
    views      INT       DEFAULT 0,
    likes      INT       DEFAULT 0,
    dislikes   INT       DEFAULT 0,
    enabled    BOOLEAN   DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Post version table creation
CREATE TABLE blog.post_version
(
    id         INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    post_id    INT REFERENCES blog.post (id),
    version    INT,
    content    TEXT NOT NULL,
    image_url  TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comment table creation
CREATE TABLE blog.comment
(
    id         INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    public_id  VARCHAR(12) NOT NULL,
    post_id    INT REFERENCES blog.post (id),
    user_id    INT REFERENCES blog.user (id),
    content    TEXT        NOT NULL,
    is_removed BOOLEAN   DEFAULT FALSE,
    removed_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Relacionamento entre usuário e posts: um usuário pode ter vários posts
ALTER TABLE blog.post
    ADD CONSTRAINT fk_post_user
        FOREIGN KEY (user_id)
            REFERENCES blog.user (id);

-- Relacionamento entre usuário e comentários: um usuário pode ter vários comentários
ALTER TABLE blog.comment
    ADD CONSTRAINT fk_comment_user
        FOREIGN KEY (user_id)
            REFERENCES blog.user (id);

-- Relacionamento entre post e comentários: um post pode ter vários comentários
ALTER TABLE blog.comment
    ADD CONSTRAINT fk_comment_post
        FOREIGN KEY (post_id)
            REFERENCES blog.post (id);

-- Relacionamento entre usuário e comentários removidos: um usuário pode remover vários comentários
ALTER TABLE blog.comment
    ADD CONSTRAINT fk_comment_removed_by
        FOREIGN KEY (removed_by)
            REFERENCES blog.user (id);

-- Unique index on user table
CREATE UNIQUE INDEX idx_user_public_id ON blog.user (public_id);

-- Unique index on post table
CREATE UNIQUE INDEX idx_post_public_id ON blog.post (public_id);

-- Unique index on post_version table
CREATE UNIQUE INDEX idx_post_version ON blog.post_version (post_id, version);

-- Unique index on comment table
CREATE UNIQUE INDEX idx_comment_public_id ON blog.comment (public_id);

--
create or replace function blog.upsert_post(_args jsonb) returns setof blog.post
    language plpgsql
as
$$
declare
    _id           integer;
    _public_id    text;
    _user_id      integer;
    _title        text;
    _content      text;
    _image_url    text;
    _version      integer;
    _post_user_id integer;
begin
    _public_id := (_args ->> 'id')::text;
    _title := (_args ->> 'title')::text;
    _content := (_args ->> 'content')::text;
    _image_url := (_args ->> 'image_url')::text;


    -- obtem id e versao do post a partir do public_id
    select id, version, user_id into _id, _version, _post_user_id from blog.post where public_id = _public_id limit 1;

    -- incrementa o numero da versao
    if _version is null then _version := 1; else _version := _version + 1; end if;

    select id into _user_id from blog.user where public_id = (_args ->> 'user_id')::text limit 1;

    -- se o dono do post nao for o mesmo que esta tentando editar
    if (_user_id is null) then raise exception 'User not allowed'; end if;
    if (_user_id <> _post_user_id) then raise exception 'User not allowed to update this post'; end if;

    raise notice 'Post id: %', _id;
    raise notice 'Post user: %', _user_id;
    raise notice 'Post version: %', _version;
    raise notice 'Post content: %', _content;
    raise notice 'Post title: %', _title;

    -- se for a primeira versao insere o post
    if (_version = 1)
    then
        insert into blog.post(public_id, user_id, version, title)
        select _public_id,
               _user_id,
               _version,
               _title
        returning id into _id;
    end if;


    -- insere a versao do post
    insert into blog.post_version(post_id, version, content, image_url)
    select _id,
           _version,
           _content,
           _image_url;

    update blog.post set version = _version, updated_at = now() where id = _id;

    return query select * from blog.post where id = _id;
end
$$;

