import lodashGet from 'lodash/get';
import React from 'react';
import {TNodeChildrenRenderer} from 'react-native-render-html';
import AnchorForAttachmentsOnly from '@components/AnchorForAttachmentsOnly';
import AnchorForCommentsOnly from '@components/AnchorForCommentsOnly';
import * as HTMLEngineUtils from '@components/HTMLEngineProvider/htmlEngineUtils';
import Text from '@components/Text';
import useEnvironment from '@hooks/useEnvironment';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import styles from '@styles/styles';
import * as Link from '@userActions/Link';
import CONST from '@src/CONST';
import htmlRendererPropTypes from './htmlRendererPropTypes';

function AnchorRenderer(props) {
    const htmlAttribs = props.tnode.attributes;
    const {environmentURL} = useEnvironment();
    // An auth token is needed to download Expensify chat attachments
    const isAttachment = Boolean(htmlAttribs[CONST.ATTACHMENT_SOURCE_ATTRIBUTE]);
    const displayName = lodashGet(props.tnode, 'domNode.children[0].data', '');
    const parentStyle = lodashGet(props.tnode, 'parent.styles.nativeTextRet', {});
    const attrHref = htmlAttribs.href || '';

    if (!HTMLEngineUtils.isInsideComment(props.tnode)) {
        // This is not a comment from a chat, the AnchorForCommentsOnly uses a Pressable to create a context menu on right click.
        // We don't have this behaviour in other links in NewDot
        // TODO: We should use TextLink, but I'm leaving it as Text for now because TextLink breaks the alignment in Android.
        return (
            <Text
                style={styles.link}
                onPress={() => Link.openLink(attrHref, environmentURL, isAttachment)}
                suppressHighlighting
            >
                <TNodeChildrenRenderer tnode={props.tnode} />
            </Text>
        );
    }

    if (isAttachment) {
        return (
            <AnchorForAttachmentsOnly
                source={tryResolveUrlFromApiRoot(attrHref)}
                displayName={displayName}
            />
        );
    }

    return (
        <AnchorForCommentsOnly
            href={attrHref}
            // Unless otherwise specified open all links in
            // a new window. On Desktop this means that we will
            // skip the default Save As... download prompt
            // and defer to whatever browser the user has.
            // eslint-disable-next-line react/jsx-props-no-multi-spaces
            target={htmlAttribs.target || '_blank'}
            rel={htmlAttribs.rel || 'noopener noreferrer'}
            style={{...props.style, ...parentStyle, ...styles.textUnderlinePositionUnder, ...styles.textDecorationSkipInkNone}}
            key={props.key}
            displayName={displayName}
            // Only pass the press handler for internal links. For public links or whitelisted internal links fallback to default link handling
            onPress={internalNewExpensifyPath || internalExpensifyPath ? navigateToLink : undefined}
        >
            <TNodeChildrenRenderer tnode={props.tnode} />
        </AnchorForCommentsOnly>
    );
}

AnchorRenderer.propTypes = htmlRendererPropTypes;
AnchorRenderer.displayName = 'AnchorRenderer';

export default AnchorRenderer;
