# Overview

This indexer is created from indexer-sdk, see a more detailed readme in [example indexer repo](https://github.com/aptos-labs/aptos-indexer-processor-example).

We use the term indexer and processor interchangeably.

When developing locally, you can use a local Postgres DB and run the indexer locally.

When deploying to the cloud, I recommend using [Neon Postgres](https://neon.tech/) or Google Cloud SQL for database and Google Cloud Run for hosting indexer.

## Pre-requisites

Install rust.

Install postgres.

Install diesel cli to run migrations. Please only use this command to install diesel cli because we only need postgres feature.

```sh
cargo install diesel_cli --no-default-features --features postgres
```

Install docker because we need to put indexer in docker container when deploying to cloud.

## Running the indexer locally

**Note: all commends below need to be run in the current indexer directory instead of root directory.**

### Steps

Drop the DB if exists. You cannot do this if you are using a cloud DB. Follow the revert migration command below instead.

```sh
psql postgres://username:password@127.0.0.1:5432/postgres \
    -c 'DROP DATABASE IF EXISTS "example-indexer"'
```

Create the DB.

```sh
psql postgres://username:password@127.0.0.1:5432/postgres \
    -c 'CREATE DATABASE "example-indexer"'
```

Create a new migration file.

```sh
diesel migration generate create-abc-table \
    --config-file="src/db_migrations/diesel.toml"
```

Run all pending migrations.

```sh
diesel migration run \
    --config-file="src/db_migrations/diesel.toml" \
    --database-url="postgresql://username:password@localhost:5432/example-indexer"
```

In case you want to revert all migrations. On cloud provider, you cannot drop database, so you need to revert all migrations if you want to reset.

```sh
**diesel migration revert \
	--all \
	--config-file="src/db_migrations/diesel.toml" \
    --database-url="postgresql://username:password@localhost:5432/example-indexer"**
```

Create a `config.yaml` file from `example.config.yaml` file to point to the correct network, db url, start version, etc. Run the indexer.

```sh
cargo run --release -- -c config.yaml
```

You should see the indexer start to index Aptos blockchain events!

```sh
"timestamp":"2024-08-15T01:06:35.169217Z","level":"INFO","message":"[Transaction Stream] Received transactions from GRPC.","stream_address":"https://grpc.testnet.aptoslabs.com/","connection_id":"5575cb8c-61fb-498f-aaae-868d1e8773ac","start_version":0,"end_version":4999,"start_txn_timestamp_iso":"1970-01-01T00:00:00.000000000Z","end_txn_timestamp_iso":"2022-09-09T01:49:02.023089000Z","num_of_transactions":5000,"size_in_bytes":5708539,"duration_in_secs":0.310734,"tps":16078,"bytes_per_sec":18371143.80788713,"filename":"/Users/reneetso/.cargo/git/checkouts/aptos-indexer-processor-sdk-2f3940a333c8389d/e1e1bdd/rust/transaction-stream/src/transaction_stream.rs","line_number":400,"threadName":"tokio-runtime-worker","threadId":"ThreadId(6)"
"timestamp":"2024-08-15T01:06:35.257756Z","level":"INFO","message":"Events version [0, 4999] stored successfully","filename":"src/processors/events/events_storer.rs","line_number":75,"threadName":"tokio-runtime-worker","threadId":"ThreadId(10)"
"timestamp":"2024-08-15T01:06:35.257801Z","level":"INFO","message":"Finished processing events from versions [0, 4999]","filename":"src/processors/events/events_processor.rs","line_number":90,"threadName":"tokio-runtime-worker","threadId":"ThreadId(17)"
```

## Get ready for cloud deployment

I'm using GCP Cloud Run and Artifact Registry.

You can learn more about publishing to Artifact Registry on their docs:

- https://cloud.google.com/artifact-registry/docs/docker/pushing-and-pulling#pushing
- https://cloud.google.com/artifact-registry/docs/docker/store-docker-container-images

And deploying to Cloud Run:

- https://cloud.google.com/run/docs/quickstarts/deploy-container

### Build the docker image locally and run the container locally

Build the docker image targeting linux/amd64 because eventually, we will push the image to Artifact Registry and deploy it to Cloud Run.

```sh
docker build --platform linux/amd64 -t bounty-app-indexer .
```

Run the docker container locally. Mac supports linux/amd64 emulation so you can run the container locally.

```sh
docker run -p 8080:8080 -it bounty-app-indexer
```

### Push the locally build docker image to Artifact Registry

Tag the docker image.

```sh
docker tag bounty-app-indexer us-west1-docker.pkg.dev/bounty-app-436505/indexer-repo/indexer
```

Login to google cloud

```sh
gcloud auth login
```

Push the docker image to the container registry.

```sh
docker push us-west1-docker.pkg.dev/bounty-app-436505/indexer-repo/indexer
```

### Upload the config.yaml file to Secret Manager

Go to secret manager and create a new secret with the content of the config.yaml file.

### Run the container on Cloud Run

Video walkthrough: https://drive.google.com/file/d/1JayWuH2qgnqOgzVuZm9MwKT42hj4z0JN/view

Go to cloud run dashboard, create a new service, and select the container image from Artifact Registry, also add a volume to ready the config.yaml file from Secret Manager, then mount the volume to the container.

**NOTE**: always allocate cpu so it always runs instead of only run when there is traffic. Min and max instances should be 1.

## Re-indexing

If you make change to DB schema or update the point calculation logic, you need to re-index the data.

**WARNING**: Do not try to backfill the data, the point data logic is read + update, if you backfill like processing same events twice, you will get wrong point data. So please always revert all migrations and re-index from the first tx your contract deployed.