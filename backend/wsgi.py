from importlib.util import spec_from_file_location, module_from_spec

spec = spec_from_file_location("app_file", "app.py")
mod = module_from_spec(spec)
spec.loader.exec_module(mod)


app = mod.create_app()
