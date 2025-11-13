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
                           option6, option7, option8, option9, option10,
                           created_at, is_active, allow_custom_answers
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
                
                options = [row[i] for i in range(3, 13) if row[i] is not None]
                
                poll_data = {
                    'id': row[0],
                    'target_audience': row[1],
                    'question': row[2],
                    'options': options,
                    'created_at': row[13].isoformat() if row[13] else None,
                    'allow_custom_answers': row[14] if len(row) > 14 else False
                }
                
                cur.execute('SELECT COUNT(*) FROM poll_responses WHERE poll_id = %s', (poll_id,))
                total_responses = cur.fetchone()[0]
                
                poll_data['total_responses'] = total_responses
                
                if user_fingerprint:
                    cur.execute('''
                        SELECT selected_option, comment, custom_answer 
                        FROM poll_responses 
                        WHERE poll_id = %s AND user_fingerprint = %s
                    ''', (poll_id, user_fingerprint))
                    user_response = cur.fetchone()
                    poll_data['user_voted'] = user_response is not None
                    
                    if user_response:
                        poll_data['user_answer'] = {
                            'option': user_response[0],
                            'comment': user_response[1],
                            'custom_answer': user_response[2]
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
                           option1, option2, option3, option4, option5,
                           option6, option7, option8, option9, option10,
                           allow_custom_answers
                    FROM polls 
                    WHERE is_active = true
                    ORDER BY created_at DESC
                ''')
                
                polls = []
                for row in cur.fetchall():
                    options = [row[i] for i in range(3, 13) if row[i] is not None]
                    poll = {
                        'id': row[0],
                        'target_audience': row[1],
                        'question': row[2],
                        'options': options,
                        'allow_custom_answers': row[13] if len(row) > 13 else False
                    }
                    
                    if user_fingerprint:
                        cur.execute('''
                            SELECT COUNT(*) FROM poll_responses 
                            WHERE poll_id = %s AND user_fingerprint = %s
                        ''', (row[0], user_fingerprint))
                        has_voted = cur.fetchone()[0] > 0
                        poll['user_voted'] = has_voted
                    else:
                        poll['user_voted'] = False
                    
                    polls.append(poll)
                
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
                custom_answer = body_data.get('custom_answer', '')
                
                if not all([poll_id, user_fingerprint]):
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'error': 'Missing required fields'}),
                        'isBase64Encoded': False
                    }
                
                if selected_option and (selected_option < 1 or selected_option > 10):
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'error': 'Invalid option'}),
                        'isBase64Encoded': False
                    }
                
                if len(comment) > 100:
                    comment = comment[:100]
                if len(custom_answer) > 100:
                    custom_answer = custom_answer[:100]
                
                try:
                    cur.execute('''
                        INSERT INTO poll_responses 
                        (poll_id, user_fingerprint, selected_option, comment, custom_answer)
                        VALUES (%s, %s, %s, %s, %s)
                    ''', (poll_id, user_fingerprint, selected_option, comment, custom_answer))
                    conn.commit()
                    
                    cur.execute('SELECT option1, option2, option3, option4, option5, option6, option7, option8, option9, option10 FROM polls WHERE id = %s', (poll_id,))
                    poll_options = cur.fetchone()
                    num_options = len([opt for opt in poll_options if opt])
                    
                    stats = []
                    for i in range(1, num_options + 1):
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
                allow_custom_answers = body_data.get('allow_custom_answers', False)
                
                print(f'Create poll request: question={question}, options={options}, allow_custom={allow_custom_answers}')
                
                if len(target_audience) > 30:
                    target_audience = target_audience[:30]
                if len(question) > 100:
                    question = question[:100]
                
                if not question:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'error': 'Question is required'}),
                        'isBase64Encoded': False
                    }
                
                if not allow_custom_answers:
                    if len(options) < 2 or len(options) > 10:
                        return {
                            'statusCode': 400,
                            'headers': headers,
                            'body': json.dumps({'error': 'Invalid poll data: need 2-10 options'}),
                            'isBase64Encoded': False
                        }
                else:
                    if len(options) > 10:
                        return {
                            'statusCode': 400,
                            'headers': headers,
                            'body': json.dumps({'error': 'Too many options (max 10)'}),
                            'isBase64Encoded': False
                        }
                
                # Pad with empty strings for first 5 options (NOT NULL), None for 6-10
                if len(options) < 5:
                    options_padded = options + [''] * (5 - len(options)) + [None] * 5
                else:
                    options_padded = options + [None] * (10 - len(options))
                
                cur.execute('''
                    INSERT INTO polls 
                    (target_audience, question, option1, option2, option3, option4, option5, option6, option7, option8, option9, option10, allow_custom_answers)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING id
                ''', (target_audience, question, *options_padded, allow_custom_answers))
                
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
                allow_custom_answers = body_data.get('allow_custom_answers', False)
                
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
                
                if not question:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'error': 'Question is required'}),
                        'isBase64Encoded': False
                    }
                
                if not allow_custom_answers:
                    if len(options) < 2 or len(options) > 10:
                        return {
                            'statusCode': 400,
                            'headers': headers,
                            'body': json.dumps({'error': 'Invalid poll data: need 2-10 options'}),
                            'isBase64Encoded': False
                        }
                else:
                    if len(options) > 10:
                        return {
                            'statusCode': 400,
                            'headers': headers,
                            'body': json.dumps({'error': 'Too many options (max 10)'}),
                            'isBase64Encoded': False
                        }
                
                conn = get_db_connection()
                cur = conn.cursor()
                
                # Pad with empty strings for first 5 options (NOT NULL), None for 6-10
                if len(options) < 5:
                    options_padded = options + [''] * (5 - len(options)) + [None] * 5
                else:
                    options_padded = options + [None] * (10 - len(options))
                
                cur.execute('''
                    UPDATE polls 
                    SET target_audience = %s, question = %s,
                        option1 = %s, option2 = %s, option3 = %s, option4 = %s, option5 = %s,
                        option6 = %s, option7 = %s, option8 = %s, option9 = %s, option10 = %s,
                        allow_custom_answers = %s
                    WHERE id = %s
                ''', (target_audience, question, *options_padded, allow_custom_answers, poll_id))
                
                if cur.rowcount == 0:
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 404,
                        'headers': headers,
                        'body': json.dumps({'error': 'Poll not found or already inactive'}),
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
                
                conn = get_db_connection()
                cur = conn.cursor()
                
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