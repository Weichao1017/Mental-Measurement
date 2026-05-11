# 量表权威来源与接力指南

每个量表的：原始论文、官方中文版引用、Claude Code 接力时需要做的事。

---

## DASS-21 ✅ 已核对

**原始量表**
- Lovibond, S.H., & Lovibond, P.F. (1995). *Manual for the Depression Anxiety Stress Scales* (2nd ed.). Sydney: Psychology Foundation of Australia. ISBN 0-7334-1423-0.
- Henry, J.D., & Crawford, J.R. (2005). The short-form version of the Depression Anxiety Stress Scales (DASS-21). *British Journal of Clinical Psychology*, 44(2), 227–239.

**中文翻译**
- Taouk, M., Lovibond, P.F., & Laube, R. (2001). *Translation of the Depression Anxiety Stress Scales into Chinese*. Transcultural Mental Health Centre, Cumberland Hospital, Sydney.
- 龚栩, 谢熹瑶, 徐蕊, 罗跃嘉. (2010). DASS-21 简体中文版在中国大学生中的测试报告. *中国临床心理学杂志*, 18(4), 443–446.

**官网**：http://www2.psy.unsw.edu.au/dass/

**本项目采用**：UNSW 官方简体中文 DASS-42 PDF 抽取的 21 题（按 Lovibond 标准映射）

**接力任务**：上线前最后做一遍核对，参考 `docs/DASS-21-mapping.md`

---

## WHO-5 ✅ 已核对

**原始量表**
- Topp, C. W., Østergaard, S. D., Søndergaard, S., & Bech, P. (2015). The WHO-5 Well-Being Index: a systematic review of the literature. *Psychotherapy and Psychosomatics*, 84(3), 167–176.

**中文翻译**
- WHO Collaborating Centre in Mental Health (Frederiksborg) 官方多语言版本中的简体中文版

**官网**：https://www.psykiatri-regionh.dk/who-5/

---

## FFMQ-15 ⚠️ 待核对

**短版来源**
- Gu, J., Strauss, C., Crane, C., Barnhofer, T., Karl, A., Cavanagh, K., & Kuyken, W. (2016). Examining the Factor Structure of the 39-Item and 15-Item Versions of the Five Facets Mindfulness Questionnaire Before and After Mindfulness-Based Cognitive Therapy for People with Recurrent Depression. *Psychological Assessment*, 28(7), 791–802.

**原始 39 题量表**
- Baer, R. A., Smith, G. T., Hopkins, J., Krietemeyer, J., & Toney, L. (2006). Using self-report assessment methods to explore facets of mindfulness. *Assessment*, 13(1), 27–45.

**中文版**
- 邓玉琴, 刘兴华, 攸佳宁, 唐一源. (2009). 正念注意觉知量表中文版的修订. *中国健康心理学杂志*, 17(2), 148-151.
- Deng, Y.Q., Liu, X.H., Rodriguez, M.A., & Xia, C.Y. (2011). The Five Facet Mindfulness Questionnaire: psychometric properties of the Chinese version. *Mindfulness*, 2(2), 123–128.

**接力任务**
1. 拿到 Gu et al. (2016) 论文（PsychInfo / Google Scholar 可下载），从附录拿到 FFMQ-15 的 15 题在 FFMQ-39 中的题号映射
2. 拿到 Deng et al. (2011) 论文附录的 FFMQ-39 中文版题目
3. 按 Gu 的 15 题题号从 Deng 的中文 39 题里抽出对应 15 题
4. 替换 `src/lib/scales/ffmq15.ts` 里的 `[TBD-VERIFY]` 占位
5. 核对每题的 facet（OBS/DES/AWA/NJ/NR）和 reverse 标识

**反向计分注意**：AWA 和 NJ 子量表通常全部反向计分。具体每个 item 要按 Baer (2006) 原表标识为准。

---

## SCS-SF ⚠️ 待核对

**短版来源**
- Raes, F., Pommier, E., Neff, K. D., & Van Gucht, D. (2011). Construction and factorial validation of a short form of the Self-Compassion Scale. *Clinical Psychology & Psychotherapy*, 18(3), 250–255.

**中文版**
- Chen, J., Yan, L., & Zhou, L. (2011). Reliability and validity of Chinese version of Self-Compassion Scale. *中国临床心理学杂志*, 19(6), 734–736.

**作者授权**：Neff 官方网站 https://self-compassion.org/scales/ 公开供研究使用

**接力任务**
1. 从 Raes et al. (2011) 拿到 12 题英文原文（短版每个子量表 2 题）
2. 从 Chen et al. (2011) 中文版（或原始 SCS-26 中文版）抽出对应 12 题
3. 注意 SCS-SF 总分通常使用全部 12 题反向后求均值（不是各维度均值求和）
4. 替换 `src/lib/scales/scs-sf.ts` 里的 `[TBD-VERIFY]` 占位

---

## MAIA-2 ⚠️ 待核对

**原始量表**
- Mehling, W. E., Acree, M., Stewart, A., Silas, J., & Jones, A. (2018). The Multidimensional Assessment of Interoceptive Awareness, Version 2 (MAIA-2). *PLoS ONE*, 13(12), e0208034.
- MAIA-1：Mehling et al. (2012). *PLoS ONE*, 7(11), e48230.

**中文版**
- 暂未找到广泛使用的简体中文修订。可能可用的：
  - Lin, F. L., Hsu, C. C., Mehling, W., & Yeh, M. L. (2017) 台湾繁体版
  - 国内近期可能有研究生论文做了简体版（需检索 CNKI）

**官网**：https://osher.ucsf.edu/research/maia

**接力任务**
1. 从 Mehling et al. (2018) PLoS ONE 论文附录拿到 37 题英文（开源）
2. 检索 CNKI / Google Scholar 找最新的 MAIA-2 简体中文修订；若无，则需委托双语心理学专业人士做翻译（不建议 Claude Code 自行翻译，因为内感受领域用词专业）
3. 注意 Not-Distracting (6 题) 和 Not-Worrying (5 题) 是反向计分
4. 替换 `src/lib/scales/maia2.ts` 里的 `[TBD-VERIFY]` 占位

**如果中文版暂时拿不到**：可以先把 MAIA-2 设为"暂未上线"，从 intake 触发列表移除，等中文版到位再上。

---

## DERS-SF ⚠️ 待核对

**短版来源**
- Kaufman, E. A., Xia, M., Fosco, G., Yaptangco, M., Skidmore, C. R., & Crowell, S. E. (2016). The Difficulties in Emotion Regulation Scale Short Form (DERS-SF). *Journal of Psychopathology and Behavioral Assessment*, 38(3), 443–455.

**原始 36 题**
- Gratz, K. L., & Roemer, L. (2004). Multidimensional assessment of emotion regulation and dysregulation. *Journal of Psychopathology and Behavioral Assessment*, 26(1), 41–54.

**中文版（36 题）**
- 李英华 et al. (2014). 情绪调节困难量表中文版的修订. *中国心理卫生杂志*.

**接力任务**
1. 从 Kaufman et al. (2016) 拿 DERS-SF 的 18 题在 DERS-36 中的题号
2. 从李英华 (2014) DERS-36 中文版抽对应 18 题
3. AWA 和 CLA 子量表反向计分
4. 替换占位

---

## PSQI ⚠️ 待核对（且需要专用 UI）

**原始量表**
- Buysse, D. J., Reynolds, C. F., Monk, T. H., Berman, S. R., & Kupfer, D. J. (1989). The Pittsburgh Sleep Quality Index. *Psychiatry Research*, 28(2), 193–213.

**中文版**
- 刘贤臣, 唐茂芹, 胡蕾, 吴宏新, 张璐霞, 高乃明. (1996). 匹兹堡睡眠质量指数的信度和效度研究. *中华精神科杂志*, 29(2), 103–107.

**接力任务**
PSQI 是本项目最复杂的量表，需要的工作量较大：

1. **UI 开发**：题型混合（时长输入、频率单选、单选评分）
   - 需要新组件：`TimeInput.tsx`（HH:MM）、`DurationInput.tsx`（小时数）、`FrequencyChoice.tsx`（4 级频率）
   - PSQI 不能直接复用 `LikertItem`
2. **计分算法**：7 个 component 各自加权（具体公式见 Buysse 1989 论文）
   - 在 `src/lib/scoring.ts` 加 `scorePSQI(scale, response)` 分支
3. **题目内容**：从刘贤臣 (1996) 修订版抄入

**临床切点**：
- 总分 ≤ 5：睡眠良好
- 总分 6–7：一般
- 总分 ≥ 8：中国常模建议作为"睡眠障碍"切点

---

## ECR-12 ⚠️ 待核对

**短版来源**（两个流通版本，选其一）
- Wei, M., Russell, D. W., Mallinckrodt, B., & Vogel, D. L. (2007). The Experiences in Close Relationship Scale (ECR)-Short Form. *Journal of Personality Assessment*, 88(2), 187–204.
- Lafontaine, M. F., Brassard, A., Lussier, Y., Valois, P., Shaver, P. R., & Johnson, S. M. (2016). Selecting the best items for a short-form of the ECR. *European Journal of Psychological Assessment*, 32(2), 140–154.

**原始 36 题**
- Brennan, K. A., Clark, C. L., & Shaver, P. R. (1998).

**中文版**
- 李同归, 加藤和生. (2006). 成人依恋的测量：亲密关系经历量表（ECR）中文版. *心理学报*, 38(3), 399–406.

**接力任务**
1. 选定短版（建议 Wei 2007，更通用）
2. 拿到 12 题英文原文
3. 从李同归 (2006) ECR-36 中文版抽对应 12 题
4. 注意 Avoidance 维度通常包含反向题
5. 替换占位

---

## 通用注意事项

1. **不要凭记忆抄题**。所有中文措辞必须从公开发表的中文修订论文 PDF 抄取。
2. **反向题位置**必须和原作者一致，不能自己倒推。
3. **任何修改后跑** `npm run test:scoring` 确保单元测试通过。
4. 若发现某个量表的中文版引文找不到原文，宁可在落地页移除该模块也不要凭感觉填题。
5. 完成核对后，把对应文件的 `fullyVerified: false` 改为 `true`，并把这份文档对应小节的 ⚠️ 改成 ✅。
