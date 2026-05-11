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
          <ul className="space-y-3 text-brand-800">
            <li>
              <span className="font-medium">情绪症状（DASS-21）</span>
              <span className="text-sm text-brand-600">
                ·过去一周抑郁、焦虑、压力的强度
              </span>
            </li>
            <li>
              <span className="font-medium">主观幸福感（WHO-5）</span>
              <span className="text-sm text-brand-600">
                ·过去两周的活力、平静、对生活的兴趣
              </span>
            </li>
            <li>
              <span className="font-medium">正念能力（FFMQ-15）</span>
              <span className="text-sm text-brand-600">
                ·觉察、描述、不评判、不反应等五个维度
              </span>
            </li>
            <li>
              <span className="font-medium">自我关怀（SCS-SF）</span>
              <span className="text-sm text-brand-600">
                ·你对自己的善意、共同人性的感受、对体验的正念态度
              </span>
            </li>
          </ul>
          <p className="mt-5 text-sm text-brand-500">
            根据你之后勾选的主诉，还可能加做身体觉察、情绪调节、睡眠、依恋关系等扩展模块。
          </p>
        </div>

        <div className="card mb-10 border-sage-200 bg-sage-50">
          <h2 className="mb-3 font-serif text-lg text-ink">在你开始之前</h2>
          <ul className="space-y-2 text-sm leading-relaxed text-brand-800">
            <li>· 整个评估大约需要 <strong>12 – 20 分钟</strong>，建议在安静的环境下一次性完成</li>
            <li>· 请按你<strong>近期真实</strong>的感受作答，不要思考"应该选什么"</li>
            <li>· 结果只用于帮助你和你的老师更好地了解你，不构成任何临床诊断</li>
            <li>· 如果在评估中触发了不舒服的感受，随时可以暂停</li>
          </ul>
        </div>

        <Link href="/intake/" className="btn-primary">
          开始评估 →
        </Link>
      </div>

      <footer className="mt-20 border-t border-brand-200 pt-6 text-xs text-brand-400">
        本评估基于公开发表的心理量表（DASS-21 / WHO-5 / FFMQ / SCS / MAIA-2 / DERS / PSQI / ECR）改编整理。
        结果仅供自我了解，不能替代专业诊断。
      </footer>
    </Container>
  );
}
