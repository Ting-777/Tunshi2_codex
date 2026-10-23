# 地标新增语音来源

0.7.0新增10句由本地 piper-tts 1.3.0 / zh_CN-huayan-medium 模型推理，再用ffmpeg编码MP3；共112句随包离线播放。新增声线为单说话人模型，通过语速区别儿童与豚师；音色区分度不及原多角色配音，不能宣称复刻原演员声线。原102句MP3与其来源保持。

模型及配置来自 https://huggingface.co/rhasspy/piper-voices/tree/main/zh/zh_CN/huayan/medium ，上游MODEL_CARD说明训练集 https://github.com/PlayVoice/HuaYan_TTS ，训练集许可证标注Unknown。模型不随游戏或仓库分发，清单记录本次实际模型SHA256，不另声称获得未提供的演员授权或商业语音授权。

本次原在线合成步骤被自动审批阻止：项目对白送往speech.platform.bing.com缺少明确第三方披露授权。没有重试或绕过；新增十句统一用上述离线推理重新合成。以后默认本地生成新对白，不把工具已安装视为允许发送未发布内容。
