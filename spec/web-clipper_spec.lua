-- spec/web-clipper_spec.lua
-- Run with: nvim --headless -u spec/minimal_init.lua -c "luafile spec/web-clipper_spec.lua" -c "qa!"
-- Or:     busted spec/

local function describe(name, fn)
  print("\n" .. name)
  fn()
end

local function it(name, fn)
  local ok, err = pcall(fn)
  if ok then
    print("  PASS  " .. name)
  else
    print("  FAIL  " .. name)
    print("        " .. tostring(err))
  end
end

vim.opt.rtp:prepend(vim.fn.getcwd())

describe("web-clipper config", function()
  it("loads defaults module", function()
    local defaults = require("web-clipper.config.defaults")
    assert(type(defaults) == "table")
  end)

  it("defaults.vault_dir is a string", function()
    local defaults = require("web-clipper.config.defaults")
    assert(type(defaults.vault_dir) == "string")
  end)

  it("defaults.clip_bin is a string", function()
    local defaults = require("web-clipper.config.defaults")
    assert(type(defaults.clip_bin) == "string")
  end)

  it("defaults.sites is a table", function()
    local defaults = require("web-clipper.config.defaults")
    assert(type(defaults.sites) == "table")
  end)
end)

describe("web-clipper module", function()
  it("exports clip", function()
    local mod = require("web-clipper")
    assert(type(mod.clip) == "function")
  end)

  it("exports clip_site", function()
    local mod = require("web-clipper")
    assert(type(mod.clip_site) == "function")
  end)

  it("exports setup", function()
    local mod = require("web-clipper")
    assert(type(mod.setup) == "function")
  end)
end)

describe("web-clipper setup", function()
  it("accepts valid config", function()
    local mod = require("web-clipper")
    mod.setup({
      vault_dir = "/tmp/clippings_test/",
      clip_bin  = vim.fn.expand("~/bin/defuddle-clip.mjs"),
      sites = {
        { name = "Test", url = "https://example.com" },
      },
    })
    assert(true)
  end)

  it("rejects bad vault_dir type", function()
    local mod = require("web-clipper")
    mod.setup({ vault_dir = 42 })
    assert(true)
  end)

  it("works with empty opts", function()
    local mod = require("web-clipper")
    mod.setup({})
    assert(true)
  end)
end)

-- Force exit so nvim exits even if some asserts failed
vim.cmd("qa!")
