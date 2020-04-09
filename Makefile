export PATH := ./node_modules/.bin:$(PATH)

build::
	@tsc --project tsconfig.build.json

test::
	@jest --verbose
