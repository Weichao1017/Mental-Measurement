import { notFound } from "next/navigation";
import Container from "@/components/Container";
import ScaleRunner from "@/components/ScaleRunner";
import SkipScalePlaceholder from "@/components/SkipScalePlaceholder";
import { SCALES, getScale } from "@/lib/scales";

interface PageProps {
  params: Promise<{ scaleId: string }>;
}

// 静态生成所有量表 ID 的页面（next export 需要）
export function generateStaticParams() {
  return Object.values(SCALES).map((s) => ({ scaleId: s.slug }));
}

export default async function AssessmentPage({ params }: PageProps) {
  const { scaleId } = await params;
  const scale = getScale(scaleId);
  if (!scale) {
    notFound();
  }

  return (
    <Container>
      <div className="animate-fade-in">
        {scale.items.length > 0 ? (
          <ScaleRunner scale={scale} />
        ) : (
          <SkipScalePlaceholder scaleName={scale.name} scaleId={scale.id} />
        )}
      </div>
    </Container>
  );
}
