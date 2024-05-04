import cx from 'classnames'
import s from './CrossingIllustration.module.css'

const CrossingIllustration = () => {
  const div10 = () => (
    <div className={s.div10}>
      <div className={s.t1}></div>
      <div className={s.t1}></div>
      <div className={s.t2}></div>
      <div className={s.t1}></div>
      <div className={s.t2}></div>
      <div className={s.t2}></div>
      <div className={s.t1}></div>
      <div className={s.t1}></div>
      <div className={s.t2}></div>
      <div className={s.t1}></div>
    </div>
  )

  return (
    <div className={s.container}>
      {div10()}
      <div className={cx(s.itemContainer, s.parent1)}>
        <span className={s.title}>parent #1</span>
        <div className={s.item}></div>
      </div>
      <div className={cx(s.itemContainer, s.parent2)}>
        <span className={s.title}>parent #2</span>
        <div className={s.item}></div>
      </div>
      <div className={cx(s.itemContainer, s.child1)}>
        <span className={s.title}>child #1</span>
        <div className={s.item}>{div10()}</div>
      </div>
      <div className={cx(s.itemContainer, s.child2)}>
        <span className={s.title}>child #2</span>
        <div className={s.item}>{div10()}</div>
      </div>
    </div>
  )
}

export default CrossingIllustration
