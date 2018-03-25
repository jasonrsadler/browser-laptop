/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

const React = require('react')
const {StyleSheet, css} = require('aphrodite/no-important')
const Immutable = require('immutable')

// Components
const ReduxComponent = require('../reduxComponent')
const Button = require('../common/button')
const BrowserButton = require('../common/browserButton')
const DownloadItem = require('./downloadItem')

// Actions
const windowActions = require('../../../../js/actions/windowActions')
const webviewActions = require('../../../../js/actions/webviewActions')
const appActions = require('../../../../js/actions/appActions')

// Utils
const contextMenus = require('../../../../js/contextMenus')
const downloadUtil = require('../../../../js/state/downloadUtil')
const cx = require('../../../../js/lib/classSet')
const globalStyles = require('../styles/global')

class DownloadsBar extends React.Component {
  constructor (props) {
    super(props)
  }

  onHideDownloadsToolbar = () => {
    windowActions.setDownloadsToolbarVisible(false)
    webviewActions.setWebviewFocused()
  }

  onShowDownloads = () => {
    appActions.createTabRequested({
      url: 'about:downloads'
    })
    windowActions.setDownloadsToolbarVisible(false)
  }

  mergeProps (state, ownProps) {
    const props = {}
    // used in renderer
    props.downloads = downloadUtil.getDownloadItems(state) || Immutable.List()

    return props
  }

  render () {
    return <div className={css(styles.downloadsBar)}
      data-test-id='downloadsBar'
      onContextMenu={contextMenus.onDownloadsToolbarContextMenu.bind(null, undefined, undefined)}
    >
      <div className={css(styles.downloadItems)}>
        {
          this.props.downloads.map(downloadId =>
            <DownloadItem downloadId={downloadId} />
          )
        }
      </div>
      <div className={css(styles.downloadsBar__downloadBarButtons)}>
        <BrowserButton
          secondaryColor
          l10nId='downloadViewAll'
          testId='downloadViewAll'
          custom={styles.downloadsBar__downloadBarButtons__viewAllButton}
          onClick={this.onShowDownloads}
        />
        <Button
          className={css(styles.downloadButton)}
          testId='hideDownloadsToolbar'
          onClick={this.onHideDownloadsToolbar}
        />
      </div>
    </div>
  }
}

module.exports = ReduxComponent.connect(DownloadsBar)

const styles = StyleSheet.create({
  downloadsBar: {
    userSelect: 'none',
    boxSizing: 'border-box',
    cursor: 'default',
    backgroundColor: '#e6e6e6',
    borderTop: '1px solid #888',
    color: 'black',
    display: 'flex',
    height: globalStyles.spacing.downloadsBarHeight,
    padding: '5px 20px',
    width: '100%',
    zIndex: globalStyles.zindex.zindexDownloadsBar
  },

  downloadItems: {
    display: 'flex',
    flexGrow: 1,
    position: 'relative'
  },

  downloadsBar__downloadBarButtons: {
    margin: 'auto 0',
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center'
  },

  downloadsBar__downloadBarButtons__viewAllButton: {
    marginRight: '20px'
  },

  downloadButton: {
    ':hover': {
      background: 'url(\'../../../img/toolbar/close_download_btn_hover.svg\') center no-repeat',
      backgroundSize: '14px 14px'
    },
    background: 'url(\'../../../img/toolbar/close_download_btn.svg\') center no-repeat',
    backgroundSize: '14px 14px',
    height: '18px',
    width: '18px'
  }
})
