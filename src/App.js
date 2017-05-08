import Inferno from 'inferno' // eslint-disable-line no-unused-vars
import { connect } from 'inferno-redux'

import { Gradient } from './components/index'
import { Swatch } from './containers/index'

import { updateActiveId } from './store/gradients/actions'
import { getActiveGradient } from './store/gradients/selectors'

const TRANSITION_DURATION = 400

const App = ({ activeGradient, updateActiveId, activeGradientInverse }) => (
  <div>
    <button onClick={() => updateActiveId()}>
      New Color
    </button>
    <Gradient
      transitionDuration={TRANSITION_DURATION}
      gradient={activeGradient}
      styles={{ height: '700px', width: '700px', borderRadius: '50%' }}
      wrapper
    />
    <Swatch height={100} transitionDuration={TRANSITION_DURATION} />
  </div>
)

export default connect(
  state => ({
    activeGradient: getActiveGradient(state)
  }),
  {
    updateActiveId
  }
)(App)
