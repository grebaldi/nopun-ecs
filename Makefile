export PATH := ./node_modules/.bin:$(PATH)

build::
	@tsc --project tsconfig.build.json

test::
	@jest --verbose

prepare-release::
	@sed -i 's/"version": ".*"/"version": "$(version)"/' package.json
	@git add package.json
	@git commit -m "Prepare release v$(version)"
	@git tag v$(version)

release::
	@npm publish
