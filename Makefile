export PATH := ./node_modules/.bin:$(PATH)

install::
	@yarn

build::
	@tsc --project tsconfig.build.json

test-unit::
	@jest src --verbose

test-integration::
	@jest test --verbose

test::
	@$(MAKE) test-integration
	@$(MAKE) test-unit

prepare-release::
	@sed -i 's/"version": ".*"/"version": "$(version)"/' package.json
	@git add package.json
	@git commit -m "Prepare release v$(version)"
	@git tag v$(version)

release::
	@$(MAKE) test
	@$(MAKE) build
	@npm publish

changelog::
	@echo Changes since $$(git describe --tags $$(git rev-list --tags --max-count=1)):
	@git --no-pager log --format="%C(auto) %h %s" $$(git describe --tags $$(git rev-list --tags --max-count=1))..HEAD
