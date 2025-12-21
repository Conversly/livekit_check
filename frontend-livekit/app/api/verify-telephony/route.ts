import { NextResponse } from 'next/server';
import { SipClient } from 'livekit-server-sdk';

// NOTE: you are expected to define the following environment variables in `.env.local`:
const API_KEY = process.env.LIVEKIT_API_KEY;
const API_SECRET = process.env.LIVEKIT_API_SECRET;
const LIVEKIT_URL = process.env.LIVEKIT_URL;

// don't cache the results
export const revalidate = 0;

// Convert WebSocket URL to HTTPS URL
function getApiUrl(url: string): string {
  let apiUrl = url;
  if (apiUrl.startsWith('wss://')) {
    apiUrl = apiUrl.replace('wss://', 'https://');
  } else if (apiUrl.startsWith('ws://')) {
    apiUrl = apiUrl.replace('ws://', 'http://');
  } else if (!apiUrl.startsWith('http')) {
    apiUrl = `https://${apiUrl}`;
  }
  return apiUrl;
}

export async function GET(req: Request) {
  try {
    if (LIVEKIT_URL === undefined) {
      throw new Error('LIVEKIT_URL is not defined');
    }
    if (API_KEY === undefined) {
      throw new Error('LIVEKIT_API_KEY is not defined');
    }
    if (API_SECRET === undefined) {
      throw new Error('LIVEKIT_API_SECRET is not defined');
    }

    const baseUrl = getApiUrl(LIVEKIT_URL);
    
    // Create SIP client - handles authentication automatically
    const sipClient = new SipClient(baseUrl, API_KEY, API_SECRET);

    // List SIP dispatch rules
    let dispatchRules = [];
    try {
      dispatchRules = await sipClient.listSipDispatchRule();
    } catch (error: any) {
      console.error('Error listing dispatch rules:', error.message);
    }

    // List outbound trunks
    let outboundTrunks = [];
    try {
      outboundTrunks = await sipClient.listSipOutboundTrunk();
    } catch (error: any) {
      console.error('Error listing outbound trunks:', error.message);
    }

    // List inbound trunks
    let inboundTrunks = [];
    try {
      inboundTrunks = await sipClient.listSipInboundTrunk();
    } catch (error: any) {
      console.error('Error listing inbound trunks:', error.message);
    }

    const data = {
      dispatchRules: dispatchRules.map((rule) => {
        // Check rule type - handle both camelCase and snake_case
        let ruleType = 'unknown';
        let roomPrefix = null;
        
        if (rule.rule) {
          if (rule.rule.dispatchRuleIndividual || rule.rule.dispatch_rule_individual) {
            ruleType = 'individual';
            roomPrefix = rule.rule.dispatchRuleIndividual?.roomPrefix || 
                        rule.rule.dispatch_rule_individual?.room_prefix ||
                        rule.rule.dispatchRuleIndividual?.room_prefix ||
                        rule.rule.dispatch_rule_individual?.roomPrefix;
          } else if (rule.rule.dispatchRuleDirect || rule.rule.dispatch_rule_direct) {
            ruleType = 'direct';
          } else if (rule.rule.dispatchRuleCallee || rule.rule.dispatch_rule_callee) {
            ruleType = 'callee';
          }
        }
        
        return {
          id: rule.sipDispatchRuleId,
          name: rule.name,
          ruleType,
          roomPrefix,
          trunkIds: rule.trunkIds || rule.trunk_ids || [],
          roomConfig: rule.roomConfig || rule.room_config,
          hasAgentDispatch: !!(rule.roomConfig?.agents?.length || rule.room_config?.agents?.length),
          agentNames: (rule.roomConfig?.agents || rule.room_config?.agents || []).map((a: any) => 
            a.agentName || a.agent_name || 'Unknown'
          ),
        };
      }),
      outboundTrunks: outboundTrunks.map((trunk) => ({
        id: trunk.sipTrunkId,
        name: trunk.name,
        address: trunk.address,
        numbers: trunk.numbers || [],
      })),
      inboundTrunks: inboundTrunks.map((trunk) => ({
        id: trunk.sipTrunkId,
        name: trunk.name,
        numbers: trunk.numbers || [],
      })),
      summary: {
        dispatchRulesCount: dispatchRules.length,
        outboundTrunksCount: outboundTrunks.length,
        inboundTrunksCount: inboundTrunks.length,
        hasOutboundTrunk: outboundTrunks.length > 0,
        hasDispatchRule: dispatchRules.length > 0,
      },
    };

    const headers = new Headers({
      'Cache-Control': 'no-store',
    });
    return NextResponse.json(data, { headers });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

