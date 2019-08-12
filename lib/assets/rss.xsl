<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="2.0">
    <xsl:template match="/">
        <html>
            <head>
                <title>
                    <xsl:value-of select="rss/channel/title" />
                </title>
                <style type="text/css">
                    body {
                        font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
                        max-width: 980px;
                        margin: 0 auto;
                        padding: 20px;
                        font-size: 15px;
                        color: #1a1a1a;
                    }
                    a {
                        color:#f5712c;
                        text-decoration:none;
                    }
                    h1 {
                        font-size:24px;
                        font-weight:bold;
                    }
                    .description {
                        color: #555;
                        margin: 15px 0;
                    }
                    .title {
                        font-size:16px;
                        font-weight:bold;
                        border-bottom:solid 1px #f5712c;
                    }
                </style>
            </head>
            <body>
                <xsl:apply-templates select="rss/channel" />
            </body>
        </html>
    </xsl:template>

    <xsl:template match="channel">
        <div class="header">
            <h1>
                <xsl:element name="A">
                    <xsl:attribute name="href">
                        <xsl:value-of select="link"/>
                    </xsl:attribute>
                    <xsl:value-of select="title"/>
                </xsl:element>
            </h1>
            <div class="description">
                <xsl:value-of select="description" />
            </div>
        </div>

        <table width="90%" cellpadding="4" cellspacing="0">
            <xsl:for-each select="item">
                <tr>
                    <td class="title">
                        <xsl:element name="A">
                            <xsl:attribute name="href">
                                <xsl:value-of select="link" />
                            </xsl:attribute>
                            <xsl:attribute name="target">_blank</xsl:attribute>
                            <xsl:value-of select="title" />
                        </xsl:element>
                    </td>
                </tr>
                <tr>
                    <td>
                        <xsl:value-of select="description" disable-output-escaping="yes" />
                    </td>
                </tr>
                <tr height="10">
                    <td></td>
                </tr>
            </xsl:for-each>
            <tr>
                <td height="40"></td>
            </tr>
        </table>
    </xsl:template>
</xsl:stylesheet>
