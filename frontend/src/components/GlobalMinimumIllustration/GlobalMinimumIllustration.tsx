import s from './GlobalMinimumIllustration.module.css'

const GlobalMinimumIllustration = () => {
  return (
    <div className={s.container}>
      <svg
        viewBox='0,0,500,200'
        width={500}
        height={200}
        fill='none'
        stroke='var(--c-main)'
        strokeWidth={2}
      >
        <defs>
          <marker id='head' orient='auto' markerWidth='3' markerHeight='4' refY='2' strokeWidth={1}>
            <path d='M0,0 V4 L2,2 Z' fill='var(--c-main)' />
          </marker>
        </defs>

        <path d='M0,0 Q30,120 60,50 T100,50' />
        <path d='M100,50 Q130,200 190,100 T300,70' />
        <path d='M300,70 Q340,120 370,100 T450,0' />

        <g>
          <text x={320} y={30} className={s.text}>
            mutations
          </text>
          <circle cx={410} cy={48} r={5} fill='var(--c-main)' />
          <path d='M400,48 Q380,50 374,75' className={s.mutationLine} />

          <circle cx={370} cy={92} r={5} strokeOpacity={0.5} />
          <path d='M366,80 Q350,50 325,60 ' className={s.mutationLine} />

          <circle cx={310} cy={72} r={5} strokeOpacity={0.5} />
          <path d='M320,72 Q340,70 348,85' className={s.mutationLine} />

          <circle cx={353} cy={99} r={5} stroke='var(--c-gold)' />
        </g>

        <g>
          <text x={320} y={160} className={s.text}>
            crossing
          </text>

          <path d='M415,65 Q440,180 208,93' className={s.crossingLine} />
          <circle cx={190} cy={87} r={5} opacity={0.5} />

          <path d='M180,82 Q150,75 148,116' className={s.mutationLine} />
          <circle cx={147} cy={133} r={5} stroke='var(--c-gold)' fill='var(--c-gold)' />
        </g>

        <g>
          <path d='M415,65 Q440,230 31,35' className={s.crossingLine} />
          <circle cx={15} cy={30} r={5} opacity={0.5} />

          <path d='M25,40 Q34,45 36,55' className={s.mutationLine} />
          <circle cx={38} cy={69} r={5} stroke='var(--c-gold)' />
        </g>
      </svg>
    </div>
  )
}

export default GlobalMinimumIllustration
