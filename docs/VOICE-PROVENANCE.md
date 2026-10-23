# 游戏语音来源

0.8.0活跃对白为序章70句、第一章178句，共248句，均为随包MP3离线播放。清单也保留旧版未使用的语音以便追溯，manifest总条目数不是当前对白数。

用户明确授权为本项目TTS上传所需对白与素材，并进一步明确允许speech.platform.bing.com接收对白。最终使用tools/generate_voice.py的Microsoft多角色TTS，为本轮186段本地合成对白及先前地标语音替换声线；其余已有Microsoft配音保留。使用edge-tts 7.3.1构建工具，音频生成后进入源码和PCK，游戏运行不连接TTS服务，不需要Python或任何语音模型。

豚师用Yunyang，攀哥与象象用Yunxi并以语速音调区分，听歌与沈铁川用Yunjian并以语速音调区分，炫神和孩子用Yunxia，小朋友用Xiaoxiao。人物表、语速、音高、实际音频时长和SHA256记录在assets/voice/manifest.json。均为合成声线，不是演员配音或原角色声线复刻。

此前在线尝试曾因未点名接收目的地被自动审批拦截；ONNX/Piper步骤也曾触发未授权遥测，因此一度用独立eSpeak本地合成。用户随后完成明确的目的地授权，最终在线合成成功后替换这些临时音频。不能把此前拒绝记成用户不愿授权，也不能把用户授权理解为可以关闭平台审核。

tools/generate_offline_voice.py仍提供只加载本地eSpeak的备用方式。Piper模型来自 https://huggingface.co/rhasspy/piper-voices/tree/main/zh/zh_CN/huayan/medium ，上游训练集PlayVoice/HuaYan_TTS的MODEL_CARD许可证标注Unknown；模型不随仓库或游戏分发。eSpeak NG项目：https://github.com/espeak-ng/espeak-ng 。这些构建时依赖均不是游戏运行依赖。现有活跃语音已完成替换，旧的未使用资产在清单中保留原始来源。


配音资源由Windows构建机生成并作为GitHub Release的Dolphin2-Voice包保存，VOICE-BUNDLE.json固定已发布包的SHA256。克隆或更新后运行python3 tools/restore_assets.py（Windows用py）恢复字体与原样配音；没有已发布语音包的新开发版本可用tools/generate_voice.py生成新增对白。Windows游戏包已含全部248句活跃语音，运行不联网。MP3与运行语音清单是可恢复的构建资源，不直接逐句提交Git。
