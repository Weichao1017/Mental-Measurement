import Link from "next/link";
import Container from "@/components/Container";

export default function HomePage() {
  return (
    <Container>
      <div className="animate-fade-in">
        <p className="mb-4 text-sm uppercase tracking-[0.2em] text-brand-400">
          Mental Measurement
        </p>
        <h1 className="mb-6 font-serif text-4xl leading-tight text-ink sm:text-5xl">
          一份认真的心理状态自评
        </h1>
        <p className="mb-10 max-w-prose text-lg leading-relaxed text-brand-700">
          这是一份给愿意花十几分钟认真了解自己的人准备的评估。
          所有题目都来自国际公开发表、被研究反复验证的心理量表。
          完成后你会得到一份属于自己的多维度画像——
          也是你和你的疗愈老师之后一起工作的起点。
        </p>

        <div className="card mb-8">
          <h2 className="mb-4 font-serif text-xl text-ink">这份评估包括什么</h2>
          <p className="mb-4 text-sm leading-relaxed text-brand-700">
            <span className="font-medium text-ink">核心：</span>
            DASS-21 抑郁焦虑压力量表（21 题，约 4 分钟）——所有人都做。
          </p>
          <p className="mb-2 text-sm leading-relaxed text-brand-700">
            <span className="font-medium text-ink">可选模块：</span>
            根据你之后勾选的兴趣方向，加做不同的量表（每个 3-8 分钟）：
          </p>
          <ul className="ml-4 space-y-1 text-sm text-brand-600">
            <li>· 主观幸福感（WHO-5）/ 正念能力（FFMQ）/ 自我关怀（SCS）</li>
            <li>· 身体觉察（MAIA）/ 情绪调节（DERS）/ 睡眠（PSQI）/ 依恋（ECR）</li>
          </ul>
          <p className="mt-5 text-sm text-brand-500">
            想直接选某一个量表做？去
            <Link href="/library/" className="text-sage-700 underline">测评题库</Link>
            。
          </p>
        </div>

        <div className="card mb-10 border-sage-200 bg-sage-50">
          <h2 className="mb-3 font-serif text-lg text-ink">在你开始之前</h2>
          <ul className="space-y-2 text-sm leading-relaxed text-brand-800">
            <li>· 完整评估大约 <strong>5 – 25 分钟</strong>（取决于你选了多少可选模块）</li>
            <li>· 请按你<strong>近期真实</strong>的感受作答，不要思考"应该选什么"</li>
            <li>· 结果只用于帮助你和你的老师更好地了解你，不构成任何临床诊断</li>
            <li>· 如果在评估中触发了不舒服的感受，随时可以暂停</li>
          </ul>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/intake/" className="btn-primary">
            开始评估 →
          </Link>
          <Link href="/library/" className="btn-ghost">
            浏览题库
          </Link>
        </div>
      </div>

      <footer className="mt-20 border-t border-brand-200 pt-6 text-xs text-brand-400">
        本评估基于公开发表的心理量表（DASS-21 / WHO-5 / FFMQ / SCS / MAIA-2 / DERS / PSQI / ECR）改编整理。
        结果仅供自我了解，不能替代专业诊断。
      </footer>
    </Container>
  );
}
