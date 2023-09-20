# Env
ENV=./.env
include $(ENV)

# Executables (local)
DOCKER_COMP = docker-compose

# Env override
ifneq ("$(wildcard ./.env.local)","")
    ENV=./.env.local
    include $(ENV)
    ENV_FILE_PARAM = --env-file $(ENV)
endif

ifneq ("$(wildcard docker-compose.$(NODE_ENV).yaml)","")
	DOCKER_COMPOSE_OVERRIDE =-f docker-compose.$(NODE_ENV).yaml
endif

DOCKER_COMPOSE_CONFIG = -f docker-compose.yaml

DOCKER_COMPOSE_CONFIG += $(DOCKER_COMPOSE_OVERRIDE)

DOCKER_COMPOSE = @$(DOCKER_COMP) $(DOCKER_COMPOSE_CONFIG) $(ENV_FILE_PARAM)

# Misc
.DEFAULT_GOAL = help
.PHONY        = help build up start down logs sh composer vendor sf cc

help:
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n"} /^[$$()% a-zA-Z_-]+:.*?##/ { printf "  \033[32m%-30s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

show-config: ## Shows docker-compose config with current env
	@echo "Configs includes:" $(DOCKER_COMPOSE_CONFIG)
	@$(DOCKER_COMPOSE) config

build: ## Builds the Docker images
	@$(DOCKER_COMPOSE) build --pull --no-cache

id:	## Id of container user, e.g: make id service=node
	 @$(DOCKER_COMPOSE) exec ${service} id

up: ## Start the docker hub in detached mode (no logs)
	@if [ "$(NODE_ENV)" != "prod" ]; then mkdir -p ./node_modules; fi
	@$(DOCKER_COMPOSE) up --detach

stop: ## Stop the docker hub
	@$(DOCKER_COMPOSE) stop

down: ## Down the docker hub
	@$(DOCKER_COMPOSE) down --remove-orphans

logs: ## Show live logs
	@$(DOCKER_COMPOSE) logs --tail=0 --follow
