
/**
 * 
 * SOURCE: https://github.com/nodemcu/nodemcu-firmware/blob/release/lua_examples/lfs/_init.lua
 * 
 * Comments were removed to reduce file size
 * 
 */

export default `
local index = node.flashindex

local lfs_t = {
    __index = function(_, name)
        local fn_ut, ba, ma, size, modules = index(name)
        if not ba then
            return fn_ut
        elseif name == '_time' then
            return fn_ut
        elseif name == '_config' then
            local fs_ma, fs_size = file.fscfg()
            return {
                lfs_base = ba,
                lfs_mapped = ma,
                lfs_size = size,
                fs_mapped = fs_ma,
                fs_size = fs_size
            }
        elseif name == '_list' then
            return modules
        else
            return nil
        end
    end,

    __newindex = function(_, name, value) -- luacheck: no unused
        error("LFS is readonly. Invalid write to LFS." .. name, 2)
    end

}

local G = getfenv()
G.LFS = setmetatable(lfs_t, lfs_t)

package.loaders[3] = function(module) -- loader_flash
    local fn, ba = index(module)
    return ba and "Module not in LFS" or fn
end

G.module = nil -- disable Lua 5.0 style modules to save RAM
package.seeall = nil

local lf, df = loadfile, dofile
G.loadfile = function(n)
    local mod, ext = n:match("(.*)%.(l[uc]a?)");
    local fn, ba = index(mod)
    if ba or (ext ~= 'lc' and ext ~= 'lua') then
        return lf(n)
    else
        return fn
    end
end

G.dofile = function(n)
    local mod, ext = n:match("(.*)%.(l[uc]a?)");
    local fn, ba = index(mod)
    if ba or (ext ~= 'lc' and ext ~= 'lua') then
        return df(n)
    else
        return fn()
    end
end

local preload = "?.lc;?.lua", "/\\n;\\n?\\n!\\n-", "@init.lua", "_G", "_LOADED", "_LOADLIB", "__add", "__call", "__concat",
    "__div", "__eq", "__gc", "__index", "__le", "__len", "__lt", "__mod", "__mode", "__mul", "__newindex", "__pow",
    "__sub", "__tostring", "__unm", "collectgarbage", "cpath", "debug", "file", "file.obj", "file.vol", "flash",
    "getstrings", "index", "ipairs", "list", "loaded", "loader", "loaders", "loadlib", "module", "net.tcpserver",
    "net.tcpsocket", "net.udpsocket", "newproxy", "package", "pairs", "path", "preload", "reload", "require", "seeall",
    "wdclr", "not enough memory", "sjson.decoder", "sjson.encoder", "tmr.timer"
`