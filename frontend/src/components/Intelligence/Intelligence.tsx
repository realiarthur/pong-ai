import { FC, Fragment, useMemo } from 'react'
import { Intelligence as IntelligenceClass } from 'classes'
import cx from 'classnames'
import s from './Intelligence.module.css'
import { getNumberString } from 'utils/getNumberString'

const NEURON_WIDTH = 35
const NEURON_HEIGHT = 16
const X_GAP = 16
const Y_GAP = 60

const getNeuronX = (neuronIndex: number, length: number) => {
  return (neuronIndex - (length - 1) / 2) * (NEURON_WIDTH + X_GAP)
}

const getNeuronY = (layerIndex: number) => {
  return layerIndex * (NEURON_HEIGHT + Y_GAP) + NEURON_HEIGHT
}

const getClassName = (value: number) => {
  if (value > 0) return s.positive
  if (value < 0) return s.negative
  return ''
}

const Neuron: FC<{
  value: number | string
  bias?: number
  weights?: number[]
  layerIndex: number
  layerLength: number
  neuronIndex: number
}> = ({ value, bias, weights, layerIndex, layerLength, neuronIndex }) => {
  const [x, y] = useMemo(() => {
    return [getNeuronX(neuronIndex, layerLength), getNeuronY(layerIndex)]
  }, [layerIndex, neuronIndex])

  let text = value
  const neuronClassName = [s.neuron]
  const isNumber = typeof value === 'number'
  if (isNumber) {
    neuronClassName.push(getClassName(value))
    if (value > 0) neuronClassName.push(s.positive)
    if (value < 0) neuronClassName.push(s.negative)
    text = getNumberString(value)
  } else {
    neuronClassName.push(s.title)
  }

  return (
    <>
      <text
        key={neuronIndex}
        x={x}
        y={y}
        width={`${NEURON_WIDTH}px`}
        className={cx(...neuronClassName)}
        // data-bias={bias}
      >
        {text}
      </text>

      {weights && isNumber && (
        <>
          {weights.map((weight, nextLayerNeuronIndex) => {
            const signal = value * weight
            return (
              <line
                key={nextLayerNeuronIndex}
                x1={getNeuronX(neuronIndex, layerLength)}
                y1={getNeuronY(layerIndex) + 8}
                x2={getNeuronX(nextLayerNeuronIndex, weights.length)}
                y2={getNeuronY(layerIndex + 1) - NEURON_HEIGHT}
                className={cx(s.signal, getClassName(signal))}
                opacity={signal === 0 ? 0 : Math.max(Math.abs(signal), 0.1)}
                // data-value={signal}
                // data-weight={weight}
              />
            )
          })}
        </>
      )}
    </>
  )
}

const Intelligence: FC<{
  intelligence: IntelligenceClass
  headers: string[]
  className?: string
}> = ({ intelligence: { values, biases, getOutputWeights }, headers, className }) => {
  return (
    <svg
      className={cx(s.intelligence, className)}
      height={values.length * (NEURON_HEIGHT + Y_GAP) + 2 * NEURON_HEIGHT - Y_GAP}
    >
      <g style={{ transform: 'translateX(50%)' }}>
        <g className={s.title}>
          <>
            {headers.map((header, headerIndex) => (
              <Neuron
                key={`title.${headerIndex}`}
                layerIndex={0}
                neuronIndex={headerIndex}
                layerLength={headers.length}
                value={header}
              />
            ))}
          </>
        </g>

        <g style={{ transform: `translateY(${1.5 * NEURON_HEIGHT}px)` }}>
          {values.map((layer, layerIndex) => (
            <Fragment key={layerIndex}>
              {layer.map((value, neuronIndex) => (
                <Neuron
                  key={neuronIndex}
                  layerIndex={layerIndex}
                  neuronIndex={neuronIndex}
                  layerLength={layer.length}
                  value={value}
                  bias={biases[layerIndex][neuronIndex]}
                  weights={getOutputWeights(layerIndex, neuronIndex)}
                />
              ))}
            </Fragment>
          ))}
        </g>
      </g>
    </svg>
  )
}

export default Intelligence
