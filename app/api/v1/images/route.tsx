import { ImageResponse } from "next/og"
import { NextRequest } from "next/server"

import { getFontsFromTemplate, getFontUrl } from "@/lib/fonts"
import { templateSchema } from "@/lib/templates"
import { templates } from "@/components/templates"

export const runtime = "edge"

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json()

    const template = templateSchema.parse(body)
    const fonts = getFontsFromTemplate(template.params)
    const fontsResponses = await Promise.all(
      fonts.map((f) =>
        fetch(getFontUrl({ family: f.family, weight: f.weight }))
      )
    )
    const fontBuffers = await Promise.all(
      fontsResponses.map((res) => res.arrayBuffer())
    )

    const { Template } = templates[template.name]

    const response = new ImageResponse(
      (
        <Template
          //@ts-ignore
          template={template}
          renderWatermark={process.env.NODE_ENV === 'production'}
        />
      ),
      {
        width: template.canvas.width,
        height: template.canvas.height,
        fonts: fonts.map((f, i) => ({
          name: f.family,
          weight: f.weight,
          data: fontBuffers[i],
          style: "normal",
        })),
        debug: process.env.NODE_ENV === 'development',
        headers: {
          'cache-control': 'public, max-age=31536000, immutable',
        },
      }
    )

    return response
  } catch (error) {
    console.error('Error generating image:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate image' }),
      {
        status: 500,
        headers: { 'content-type': 'application/json' },
      }
    )
  }
}
