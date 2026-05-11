# DASS-21 题目映射审计

> 这份文档详细记录了本项目使用的 DASS-21 简体中文题目是如何从 UNSW 官方简体中文 DASS-42 PDF 中抽取的。**任何对 `src/lib/scales/dass21.ts` 题目内容的修改都必须先核对这份审计文档**。

## 总览

- **英文母版**：DASS-21 (Lovibond & Lovibond, 1995)，UNSW 官方网站挂的 `DASS21.pdf`
- **简体中文母版**：UNSW 官方简体中文 `DASS-42`（Taouk, Lovibond & Laube, 2001）
- **抽取规则**：按 Lovibond 标定的 DASS-21 → DASS-42 子集映射，从中文 42 题里抽出对应的 21 题
- **维度**：D（抑郁）/ A（焦虑）/ S（压力），每维度 7 题，全部不反向计分
- **计分**：每维度求和（0–3 × 7 = 0–21）× 2 → 0–42，对照 Lovibond 澳大利亚成人常模

## 完整映射表

| DASS-21 # | 维度 | DASS-42 # | 简体中文题目 | 英文母版（DASS-21） |
|:---:|:---:|:---:|---|---|
| 1 | S | 22 | 我发现很难让自己安静下来休息 | I found it hard to wind down |
| 2 | A | 2 | 我感到嘴巴很干 | I was aware of dryness of my mouth |
| 3 | D | 3 | 我似乎完全不能积极乐观起来 | I couldn't seem to experience any positive feeling at all |
| 4 | A | 4 | 我感到过呼吸困难（例如：在没有体力透支的情况下而感到呼吸急促，喘不过气来） | I experienced breathing difficulty |
| 5 | D | **42** | 我发现很难发挥主动性去做事情 | I found it difficult to work up the initiative to do things |
| 6 | S | 6 | 我对于所处的环境（情况）易于反应过度 | I tended to over-react to situations |
| 7 | A | **41** | 我曾感到发抖（例如：手打哆嗦） | I experienced trembling (eg, in the hands) |
| 8 | S | 12 | 我感到时常神经紧张 | I felt that I was using a lot of nervous energy |
| 9 | A | **40** | 我担心自己可能因为惊慌而干蠢事出洋相 | I was worried about situations in which I might panic and make a fool of myself |
| 10 | D | 10 | 我感到我没什么可期待的 | I felt that I had nothing to look forward to |
| 11 | S | **39** | 我发现自己变得焦虑不安 | I found myself getting agitated |
| 12 | S | **8** | 我发现很难放松下来 | I found it difficult to relax |
| **13** | D | **26** ⚠️ | 我感到消沉和沮丧 | I felt down-hearted and blue |
| 14 | S | **35** | 我曾对阻碍我正在进行的工作的事情感到无法容忍 | I was intolerant of anything that kept me from getting on with what I was doing |
| 15 | A | **28** | 我感到我曾接近恐慌 | I felt I was close to panic |
| 16 | D | **31** | 我对任何事情都没法充满热情 | I was unable to become enthusiastic about anything |
| 17 | D | 17 | 我感到自己曾不具备作为人而存在的价值 | I felt I wasn't worth much as a person |
| **18** | S | **18** ⚠️ | 我感到我曾极容易因为小事而生气 | I felt that I was rather touchy |
| 19 | A | **25** | 在没有体力透支的情况下我也能感觉到自己的心跳或心律不正常（例如：感到心跳过快或心律不齐） | I was aware of the action of my heart in the absence of physical exertion |
| 20 | A | 20 | 没有什么特殊原因的情况下，我感到害怕 | I felt scared without any good reason |
| 21 | D | **38** | 我曾感到生活没有意义（自杀意念警示题） | I felt that life was meaningless |

## 两处"双胞胎题"必须特别注意 ⚠️

DASS-42 里有两组语义相近的题，**抽 DASS-21 时必须挑对那一道**，否则中文措辞会差一截：

### 双胞胎组 1：抑郁的"伤心"

- DASS-42 #13 中文："**我感到伤心和郁闷**"（对应英文 DASS-42 #13 "I felt sad and depressed"）
- DASS-42 #26 中文："**我感到消沉和沮丧**"（对应英文 DASS-42 #26 "I felt down-hearted and blue"）

**DASS-21 第 13 题是 "down-hearted and blue" → 必须取 DASS-42 #26（消沉和沮丧）**，不是 #13（伤心和郁闷）。

### 双胞胎组 2：压力的"易怒"

- DASS-42 #18 中文："**我感到我曾极容易因为小事而生气**"（对应英文 DASS-42 #18 "I felt that I was rather touchy"）
- DASS-42 #27 中文："**我发现我容易烦躁**"（对应英文 DASS-42 #27 "I found that I was very irritable"）

**DASS-21 第 18 题是 "rather touchy" → 必须取 DASS-42 #18（极容易因为小事而生气）**，不是 #27（容易烦躁）。

## 计分

每维度题号：

| 维度 | DASS-21 题号 |
|---|---|
| D（抑郁）| 3, 5, 10, 13, 16, 17, 21 |
| A（焦虑）| 2, 4, 7, 9, 15, 19, 20 |
| S（压力）| 1, 6, 8, 11, 12, 14, 18 |

每维度求和（0–3 × 7 = 0–21）× 2 → 0–42

## 严重程度分级（×2 后）

| 等级 | D | A | S |
|---|:---:|:---:|:---:|
| Normal 正常 | 0–9 | 0–7 | 0–14 |
| Mild 轻度 | 10–13 | 8–9 | 15–18 |
| Moderate 中度 | 14–20 | 10–14 | 19–25 |
| Severe 重度 | 21–27 | 15–19 | 26–33 |
| Extremely Severe 极重度 | 28+ | 20+ | 34+ |

## 警示

DASS-21 第 21 题"我曾感到生活没有意义"涉及自杀意念。前端逻辑：
- 用户在该题选择 **2 或 3** 时，**立即**显示心理援助提示，**不论总分多少**
- 在 `dass21.ts` 中通过 `flags: ["suicidal_ideation"]` 标识
- 在 `LikertItem.tsx` 中通过 `flagWarning && value >= 2` 触发实时提示
- 结果页（`results/page.tsx`）会在顶部独立汇总所有警示并给出求助资源

## 引用

- Lovibond, S.H., & Lovibond, P.F. (1995). *Manual for the Depression Anxiety Stress Scales* (2nd ed.). Sydney: Psychology Foundation of Australia. ISBN 0-7334-1423-0.
- Henry, J.D., & Crawford, J.R. (2005). The short-form version of the Depression Anxiety Stress Scales (DASS-21): Construct validity and normative data in a large non-clinical sample. *British Journal of Clinical Psychology*, 44(2), 227–239.
- Taouk, M., Lovibond, P.F., & Laube, R. (2001). *Translation of the Depression Anxiety Stress Scales into Chinese*. Transcultural Mental Health Centre, Cumberland Hospital, Sydney.
- 龚栩, 谢熹瑶, 徐蕊, 罗跃嘉. (2010). DASS-21 简体中文版在中国大学生中的测试报告. *中国临床心理学杂志*, 18(4), 443–446.

UNSW 官方网站：http://www2.psy.unsw.edu.au/dass/
