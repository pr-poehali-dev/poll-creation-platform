'''
Business: API для работы с опросами - получение, голосование, статистика
Args: event - dict с httpMethod, body, queryStringParameters
      context - object с attributes: request_id, function_name
Returns: HTTP response dict с данными опросов
'''
import json
import os
import psycopg2
from typing import Dict, Any, Optional
from datetime import datetime

def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            poll_id = params.get('poll_id')
            user_fingerprint = params.get('user_fingerprint')
            
            if poll_id:
                cur.execute('''
                    SELECT id, target_audience, question, 
                           option1, option2, option3, option4, option5,
                           created_at, is_active
                    FROM polls 
                    WHERE id = %s AND is_active = true
                ''', (poll_id,))
                
                row = cur.fetchone()
                if not row:
                    return {
                        'statusCode': 404,
                        'headers': headers,
                        'body': json.dumps({'error': 'Poll not found'}),
                        'isBase64Encoded': False
                    }
                
                poll_data = {
                    'id': row[0],
                    'target_audience': row[1],
                    'question': row[2],
                    'options': [row[3], row[4], row[5], row[6], row[7]],
                    'created_at': row[8].isoformat() if row[8] else None
                }
                
                cur.execute('SELECT COUNT(*) FROM poll_responses WHERE poll_id = %s', (poll_id,))
                total_responses = cur.fetchone()[0]
                
                poll_data['total_responses'] = total_responses
                
                if user_fingerprint:
                    cur.execute('''
                        SELECT selected_option, comment 
                        FROM poll_responses 
                        WHERE poll_id = %s AND user_fingerprint = %s
                    ''', (poll_id, user_fingerprint))
                    user_response = cur.fetchone()
                    poll_data['user_voted'] = user_response is not None
                    
                    if user_response:
                        poll_data['user_answer'] = {
                            'option': user_response[0],
                            'comment': user_response[1]
                        }
                        
                        stats = []
                        for i in range(1, 6):
                            cur.execute('''
                                SELECT COUNT(*) 
                                FROM poll_responses 
                                WHERE poll_id = %s AND selected_option = %s
                            ''', (poll_id, i))
                            count = cur.fetchone()[0]
                            stats.append(count)
                        
                        poll_data['statistics'] = stats
                else:
                    poll_data['user_voted'] = False
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps(poll_data),
                    'isBase64Encoded': False
                }
            else:
                cur.execute('''
                    SELECT id, target_audience, question, 
                           option1, option2, option3, option4, option5
                    FROM polls 
                    WHERE is_active = true
                    ORDER BY created_at DESC
                ''')
                
                polls = []
                for row in cur.fetchall():
                    polls.append({
                        'id': row[0],
                        'target_audience': row[1],
                        'question': row[2],
                        'options': [row[3], row[4], row[5], row[6], row[7]]
                    })
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'polls': polls}),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            if action == 'vote':
                poll_id = body_data.get('poll_id')
                user_fingerprint = body_data.get('user_fingerprint')
                selected_option = body_data.get('selected_option')
                comment = body_data.get('comment', '')
                
                if not all([poll_id, user_fingerprint, selected_option]):
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'error': 'Missing required fields'}),
                        'isBase64Encoded': False
                    }
                
                if selected_option not in [1, 2, 3, 4, 5]:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'error': 'Invalid option'}),
                        'isBase64Encoded': False
                    }
                
                if len(comment) > 100:
                    comment = comment[:100]
                
                try:
                    cur.execute('''
                        INSERT INTO poll_responses 
                        (poll_id, user_fingerprint, selected_option, comment)
                        VALUES (%s, %s, %s, %s)
                    ''', (poll_id, user_fingerprint, selected_option, comment))
                    conn.commit()
                    
                    stats = []
                    for i in range(1, 6):
                        cur.execute('''
                            SELECT COUNT(*) 
                            FROM poll_responses 
                            WHERE poll_id = %s AND selected_option = %s
                        ''', (poll_id, i))
                        count = cur.fetchone()[0]
                        stats.append(count)
                    
                    cur.execute('''
                        SELECT COUNT(*) 
                        FROM poll_responses 
                        WHERE poll_id = %s
                    ''', (poll_id,))
                    total = cur.fetchone()[0]
                    
                    cur.close()
                    conn.close()
                    
                    return {
                        'statusCode': 200,
                        'headers': headers,
                        'body': json.dumps({
                            'success': True,
                            'statistics': stats,
                            'total_responses': total
                        }),
                        'isBase64Encoded': False
                    }
                except psycopg2.IntegrityError:
                    conn.rollback()
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 409,
                        'headers': headers,
                        'body': json.dumps({'error': 'You have already voted'}),
                        'isBase64Encoded': False
                    }
            
            elif action == 'create':
                target_audience = body_data.get('target_audience', '')
                question = body_data.get('question', '')
                options = body_data.get('options', [])
                
                if len(target_audience) > 30:
                    target_audience = target_audience[:30]
                if len(question) > 100:
                    question = question[:100]
                
                if not question or len(options) != 5:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'error': 'Invalid poll data'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute('''
                    INSERT INTO polls 
                    (target_audience, question, option1, option2, option3, option4, option5)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    RETURNING id
                ''', (target_audience, question, options[0], options[1], options[2], options[3], options[4]))
                
                poll_id = cur.fetchone()[0]
                conn.commit()
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 201,
                    'headers': headers,
                    'body': json.dumps({'success': True, 'poll_id': poll_id}),
                    'isBase64Encoded': False
                }
            
            elif action == 'update':
                poll_id = body_data.get('poll_id')
                target_audience = body_data.get('target_audience', '')
                question = body_data.get('question', '')
                options = body_data.get('options', [])
                
                if not poll_id:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'error': 'Poll ID required'}),
                        'isBase64Encoded': False
                    }
                
                # Convert poll_id to int
                try:
                    poll_id = int(poll_id)
                except (ValueError, TypeError):
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'error': 'Invalid poll ID'}),
                        'isBase64Encoded': False
                    }
                
                if len(target_audience) > 30:
                    target_audience = target_audience[:30]
                if len(question) > 100:
                    question = question[:100]
                
                if not question or len(options) != 5:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'error': 'Invalid poll data'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute('''
                    UPDATE polls 
                    SET target_audience = %s, question = %s,
                        option1 = %s, option2 = %s, option3 = %s, option4 = %s, option5 = %s
                    WHERE id = %s AND is_active = true
                ''', (target_audience, question, options[0], options[1], options[2], options[3], options[4], poll_id))
                
                if cur.rowcount == 0:
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 404,
                        'headers': headers,
                        'body': json.dumps({'error': 'Poll not found'}),
                        'isBase64Encoded': False
                    }
                
                conn.commit()
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
            
            elif action == 'delete':
                poll_id = body_data.get('poll_id')
                
                if not poll_id:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'error': 'Poll ID required'}),
                        'isBase64Encoded': False
                    }
                
                # Convert poll_id to int
                try:
                    poll_id = int(poll_id)
                except (ValueError, TypeError):
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'error': 'Invalid poll ID'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute('''
                    UPDATE polls 
                    SET is_active = false
                    WHERE id = %s
                ''', (poll_id,))
                
                if cur.rowcount == 0:
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 404,
                        'headers': headers,
                        'body': json.dumps({'error': 'Poll not found'}),
                        'isBase64Encoded': False
                    }
                
                conn.commit()
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 405,
            'headers': headers,
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        if 'conn' in locals():
            conn.close()
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }