/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

const React = require('react')
const Immutable = require('immutable')

// Components
const ReduxComponent = require('../reduxComponent')
const Button = require('../common/button')

// Constants
const downloadStates = require('../../../../js/constants/downloadStates')
const {PAUSE, RESUME, CANCEL} = require('../../../common/constants/electronDownloadItemActions')
const locale = require('../../../../js/l10n')

// Actions
const appActions = require('../../../../js/actions/appActions')

// Utils
const contextMenus = require('../../../../js/contextMenus')
const downloadUtil = require('../../../../js/state/downloadUtil')
const urlUtil = require('../../../../js/lib/urlutil')
const {getOrigin} = require('../../../../js/lib/urlutil')
const {StyleSheet, css} = require('aphrodite/no-important')
const globalStyles = require('../styles/global')
const cx = require('../../../../js/lib/classSet')

class DownloadItem extends React.Component {
  constructor (props) {
    super(props)
    this.onPauseDownload = this.onDownloadActionPerformed.bind(this, PAUSE)
    this.onResumeDownload = this.onDownloadActionPerformed.bind(this, RESUME)
    this.onCancelDownload = this.onDownloadActionPerformed.bind(this, CANCEL)    
  }

  onRevealDownload = () => {
    appActions.downloadRevealed(this.props.downloadId)
  }

  onOpenDownload = () => {
    appActions.downloadOpened(this.props.downloadId)
  }

  onClearDownload = () => {
    appActions.downloadCleared(this.props.downloadId)
  }

  onShowDeleteConfirmation = () => {
    appActions.showDownloadDeleteConfirmation()
  }

  onHideDeleteConfirmation = () => {
    appActions.hideDownloadDeleteConfirmation()
  }

  onDeleteDownload = () => {
    appActions.hideDownloadDeleteConfirmation()
    appActions.downloadDeleted(this.props.downloadId)
  }

  onDownloadActionPerformed = (downloadAction) => {
    appActions.downloadActionPerformed(this.props.downloadId, downloadAction)
  }

  onCopyLinkToClipboard = () => {
    appActions.downloadCopiedToClipboard(this.props.downloadId)
  }

  onReDownload = () => {
    appActions.downloadRedownloaded(this.props.downloadId)
  }

  get isInterrupted () {
    return this.props.downloadState === downloadStates.INTERRUPTED
  }

  get isUnauthorized () {
    return this.props.downloadState === downloadStates.UNAUTHORIZED
  }

  get isInProgress () {
    return this.props.downloadState === downloadStates.IN_PROGRESS
  }

  get isCompleted () {
    return this.props.downloadState === downloadStates.COMPLETED
  }

  get isCancelled () {
    return this.props.downloadState === downloadStates.CANCELLED
  }

  get isPaused () {
    return this.props.downloadState === downloadStates.PAUSED
  }

  mergeProps (state, ownProps) {
    const download = state.getIn(['downloads', ownProps.downloadId]) || Immutable.Map()
    const origin = getOrigin(download.get('url'))

    const props = {}
    // used in renderer
    props.downloadId = ownProps.downloadId
    props.deleteConfirmationVisible = state.get('deleteConfirmationVisible')
    props.isLocalFile = urlUtil.isLocalFile(origin)
    props.isInsecure = origin && origin.startsWith('http://')
    props.percentageComplete = downloadUtil.getPercentageComplete(download)
    props.isPendingState = downloadUtil.isPendingState(download)
    props.downloadState = download.get('state')
    props.totalBytes = download.get('totalBytes')
    props.fileName = download.get('filename')
    props.origin = origin
    props.statel10n = downloadUtil.getL10nId(download)
    props.download = download // TODO (nejc) only primitive types
    props.allowPause = downloadUtil.shouldAllowPause(props.download)
    props.allowResume = downloadUtil.shouldAllowResume(props.download)
    props.allowCancel = downloadUtil.shouldAllowCancel(props.download)
    props.allowRedownload = downloadUtil.shouldAllowRedownload(props.download)
    props.allowCopyLink = downloadUtil.shouldAllowCopyLink(props.download)
    props.allowOpenDownloadLocation = downloadUtil.shouldAllowOpenDownloadLocation(props.download)
    props.allowDelete = downloadUtil.shouldAllowDelete(props.download)
    props.allowRemoveFromList = downloadUtil.shouldAllowRemoveFromList(props.download)

    return props
  }

  render () {
    const l10nStateArgs = {}
    const progressStyle = {
      width: this.props.percentageComplete
    }

    if (this.isCancelled || this.isInterrupted || this.isUnauthorized) {
      progressStyle.display = 'none'
    } else if (this.props.isPendingState) {
      l10nStateArgs.downloadPercent = this.props.percentageComplete
    }

    return <span
      onContextMenu={contextMenus.onDownloadsToolbarContextMenu.bind(null, this.props.downloadId, this.props.download)}
      onDoubleClick={this.onOpenDownload}
      onMouseLeave={this.onHideDeleteConfirmation}
      data-test-id='downloadItem'
      data-test2-id={this.isCompleted ? 'completed' : null}
      className={css(styles.downloadItem) + ' ' + (this.props.deleteConfirmationVisible ? (css(styles.deleteConfirmationVisible) + ' ') : '') + this.props.downloadState}
      >
      {
        this.props.deleteConfirmationVisible
        ? <div className={css(styles.deleteConfirmation)}>
          <span data-l10n-id='downloadDeleteConfirmation' /><Button testId='confirmDeleteButton' l10nId='ok' className={`primaryButton ${css(styles.confirmDeleteButton)}`} onClick={this.onDeleteDownload} />
        </div>
        : null
      }
      <div className={css(styles.downloadActions)}>
        {
          this.props.allowPause
          ? <Button
            testId='pauseButton'
            className='pauseButton'
            l10nId='downloadPause'
            iconClass='fa-pause'
            onClick={this.onPauseDownload}
          />
          : null
        }
        {
          this.props.allowResume
          ? <Button
            testId='resumeButton'
            className='resumeButton'
            l10nId='downloadResume'
            iconClass='fa-play'
            onClick={this.onResumeDownload}
          />
          : null
        }
        {
          this.props.allowCancel
          ? <Button
            testId='cancelButton'
            className='cancelButton'
            l10nId='downloadCancel'
            iconClass='fa-times'
            onClick={this.onCancelDownload}
          />
          : null
        }
        {
          this.props.allowRedownload
          ? <Button
            testId='redownloadButton'
            className='redownloadButton'
            l10nId='downloadRedownload'
            iconClass='fa-repeat'
            onClick={this.onReDownload}
          />
          : null
        }
        {
          this.props.allowCopyLink
          ? <Button
            testId='copyLinkButton'
            className='copyLinkButton'
            l10nId='downloadCopyLinkLocation'
            iconClass='fa-link'
            onClick={this.onCopyLinkToClipboard}
          />
          : null
        }
        {
          this.props.allowOpenDownloadLocation
          ? <Button
            testId='revealButton'
            className='revealButton'
            l10nId='downloadOpenPath'
            iconClass='fa-folder-open-o'
            onClick={this.onRevealDownload}
          />
          : null
        }
        {
          this.props.allowDelete
          ? <Button
            testId='deleteButton'
            className='deleteButton'
            l10nId='downloadDelete'
            iconClass='fa-trash-o'
            onClick={this.onShowDeleteConfirmation}
          />
          : null
        }
        {
          this.props.allowRemoveFromList
          ? <Button
            testId='downloadRemoveFromList'
            l10nId='downloadRemoveFromList'
            iconClass='fa-times'
            className='removeDownloadFromList'
            onClick={this.onClearDownload}
          />
          : null
        }
      </div>
      {
        (this.isInProgress || this.isPaused) && this.props.totalBytes
        ? <div data-test-id='downloadProgress' className={css(styles.downloadProgress)} style={progressStyle} />
        : null
      }
      <div className={css(styles.downloadInfo)}>
        <span>
          <div data-test-id='downloadFilename' className={css(styles.downloadFilename)} title={this.props.fileName + '\n' + locale.translation(this.props.statel10n)}>
            {this.props.fileName}
          </div>
          {
            this.props.origin
              ? <div data-test-id='downloadOrigin' className={css(styles.downloadOrigin)}>
                {
                  this.props.isInsecure
                    ? <span className='fa fa-unlock isInsecure' />
                    : null
                }
                <span data-l10n-id={this.props.isLocalFile ? 'downloadLocalFile' : null} title={this.props.origin + '\n' + locale.translation(this.props.statel10n)}>
                  {this.props.isLocalFile ? null : this.props.origin}
                </span>
              </div>
              : null
          }
          {
            this.isCancelled || this.isInterrupted || this.isUnauthorized || this.isCompleted || this.isPaused || this.isInProgress
            ? <div className={css(styles.downloadState)} data-l10n-id={this.props.statel10n} data-l10n-args={JSON.stringify(l10nStateArgs)} />
            : null
          }
        </span>
        <span className={`${css(styles.downloadArrow)} fa-caret-down fa`} />
      </div>
    </span>
  }
}

const styles = StyleSheet.create({
  downloadItem: {
    backgroundColor: 'white',
    border: '1px solid ' + globalStyles.color.chromeTertiary,
    borderRadius: globalStyles.radius.borderRadius,
    boxSizing: 'border-box',
    display: 'flex',
    fontSize: '11px',
    flexDirection: 'column',
    height: '50px', // TODO: add to global
    position: 'relative',
    margin: 'auto 10px auto 0',
    maxWidth: '200px',
    minWidth: '200px',
    ':hover': {
      height: '73px',
      top: '-23px'
    },
    ':not(:hover)': {
      ':nth-child(1) > div': {
        display: 'none'
      }
    }
  },

  deleteConfirmation: {
    lineHeight: 2,
    borderBottom: '1px solid #CCC',
    padding: '5px 0',
    marginBottom: 'auto 0 10px 0',
    fontSize: '12px'
  },

  confirmDeleteButton: {
    fontWeight: 'normal',
    padding: '1px',
    minWidth: '50px',
    float: 'right',
    marginRight: '-5px'
  },

  downloadActions: {
    margin: '8px 0 0'
  },

  downloadProgress: {
    backgroundColor: globalStyles.color.highlightBlue,
    transition: 'width 0.5s',
    left: 0,
    opacity: 0.5,
    position: 'absolute',
    width: '100%',
    height: '100%'
  },

  downloadInfo: {
    display: 'flex',
    margin: 'auto 0'
  },

  downloadFilename: {
    margin: 'auto 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    width: '150px'
  },

  downloadOrigin: {
    margin: 'auto 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    width: '150px'
  },

  downloadState: {
    margin: 'auto 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    width: '150px'
  },

  downloadArrow: {
    width: '14px',
    margin: 'auto 0 auto auto'
  }
})

module.exports = ReduxComponent.connect(DownloadItem)
