# 0.5.0 Windows 成品包与后续发布

直接游玩从 [Releases](https://github.com/Ting-777/Tunshi2_codex/releases) 下载 Windows ZIP，完整解压，双击 Start.cmd。无需开发环境。

每轮开发更新 VERSION、project.godot、export_presets.cfg 与 RELEASE-NOTES.md。main 游戏源码变化会触发 Tested Windows release 工作流：恢复 SHA512 验证的 Godot 4.5.2 与官方模板、恢复原字体、导入、导出 PCK、在独立目录完成原107项回归及序章30项、打包并在 Windows 上运行解压后的 EXE。任一项失败均停止发布。ZIP 只放 EXE、PCK、启动器、说明及许可，不放截图。

序章验证：`python tools/run_native.py test --suite prologue --headless --output builds/story-check`。原生截图加 `--shots`；独立 PCK 加 `--pack builds/windows-pck/Dolphin2.pck`。自动检查使用隔离存档，不读写正常序章或漫游存档。

本地打包：`python tools/package_windows.py --pack builds/windows-pck/Dolphin2.pck`。在 Windows 上用 `python tools/verify_windows_zip.py builds/artifacts/Dolphin2-Shanghai-Windows-v0.5.0.zip` 验证解压后的 EXE 自动发现 PCK。可用 `python tools/fetch_engine.py --templates` 从官方源下载并校验引擎和模板；二进制不提交。工作流首次使用 vVERSION，已存在则创建新 build 标签，保留先前包。自动 Windows 验证是无显示模式，不等于多显卡原生画面验收。

以下为 0.4.6 Windows 开发与硬件验收历史。

---

# Windows 本地开发与验证

本轮在 Windows 上恢复 main b77ba90，使用 Python 3.12.0、Godot
4.5.2.stable.official.6ce3de25a。保持 0.4.6 游戏内容、原版豚师和既定美术。

## 引擎与资源

从 [Godot 官方 4.5.2 页面](https://godotengine.org/download/archive/4.5.2-stable/)
下载 Windows x86_64 标准版。将引擎解压到 `tools/godot-4.5.2/`，或通过
`GODOT_BIN` / `--godot` 指定已有可执行文件。运行入口会拒绝其他引擎版本。
本轮下载的 ZIP 已与同一官方发行的 `SHA512-SUMS.txt` 比对：

```text
b21115cf3620438e17959d13946bf9c7dceabb6ff71ed32a68996a21e08615edd2d1a3d25641bb3e260d084b31f500231aa59fcf026a5228bcc20ac4e8bade60
```

在引擎旁建立空文件 `_sc_`，使编辑器配置与缓存保存在本地的 `editor_data/`。
这是 [Godot 官方的自包含编辑器模式](https://docs.godotengine.org/en/4.5/tutorials/io/data_paths.html#self-contained-mode)，不改变项目正常存档规则。
工具目录、字体、导入缓存、构建和截图均已忽略，不提交 GitHub。

```powershell
python tools/restore_assets.py
python tools/run_native.py import --output builds/windows-import
python tools/run_native.py run
```

恢复字体仍按固定 SHA256 校验。`.gitattributes` 固定文本 LF 换行，避免 Windows
自动 CRLF 转换破坏 `SOURCE-MANIFEST.json` 的字节校验。该清单在审查本轮修改后
刷新为 Windows 开发检查点，保留原始模型和字体哈希；旧清单仍在 Git 历史中。

## 回归与原生截图

```powershell
python tools/run_native.py test --headless --output builds/windows-source-full
python tools/run_native.py export --output builds/windows-pck
python tools/run_native.py test --pack builds/windows-pck/Dolphin2.pck --headless --output builds/windows-packed-full
python tools/run_native.py test --pack builds/windows-pck/Dolphin2.pck --suite impact --shots --output builds/windows-native-impact
```

`export` 只生成 PCK，不需要导出模板。独立 PCK 运行时工作目录为输出目录内的
`isolated/`，不从源码工作目录启动。也可以用同版 Windows release EXE 通过
`--godot <EXE路径>` 加载该 PCK；完整 EXE 导出仍需要官方同版模板。

`--suite` 支持 full、world、polish、vehicle、impact；原生测试默认不截图，
传 `--shots` 才捕获实际游戏视口。`capture` 模式生成现有场景图组。
无显示模式禁止截图，不使用 fixed-fps 加速战斗。

验证仅使用 `toon-test-save.json`，与正常游玩的 `shanghai-toon-save.json` 分开；
场景截图也显式进入测试存档槽。同一用户下的存档测试应顺序运行，避免竞争。
普通 `run` 保持原有存档行为，`--fresh` 仅跳过加载，后续仍正常保存。

入口保留 Godot 原始日志，检查运行退出码、错误日志、完整测试结果和新截图，
不会仅凭进程退出 0 宣称通过。运行游戏需要对 Godot 用户数据目录的写入权限；
编辑器自包含模式不替代该权限。在只读沙盒内，保存读取检查会真实失败，应在
正常桌面权限下重验并记录，不得修改玩法绕过失败。

本轮实际证据见 [验收报告](verification/TEST-REPORT.md) 最新章节。截图只保留于
ignored `builds/` 并在对话中展示，仓库仅收录代码和文字验收记录。
