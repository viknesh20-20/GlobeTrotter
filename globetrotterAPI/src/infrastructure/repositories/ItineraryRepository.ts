import { IItineraryRepository } from '../../domain/repositories/IItineraryRepository.js';
import { Itinerary, CreateItineraryDTO, UpdateItineraryDTO, ItineraryStop, ItineraryDay, ScheduledActivity } from '../../domain/entities/Itinerary.js';
import { query } from '../database/connection.js';

export class ItineraryRepository implements IItineraryRepository {
  async findById(id: string): Promise<Itinerary | null> {
    // Get base itinerary
    const itineraryResult = await query<Itinerary>(
      'SELECT * FROM itineraries WHERE id = $1',
      [id]
    );

    if (!itineraryResult.rows[0]) return null;

    const itinerary = itineraryResult.rows[0];

    // Get stops with their days and activities
    const stopsResult = await query<any>(
      `SELECT 
        s.id as stop_id, s.city_id, s.start_date, s.end_date, s.accommodation, s.notes as stop_notes, s."order" as stop_order,
        c.name as city_name, c.country, c.image_url,
        d.id as day_id, d.date, d.notes as day_notes,
        sa.id as activity_id, sa.start_time, sa.end_time, sa.notes as activity_notes, sa.status, sa.actual_cost,
        a.id as act_id, a.name as activity_name, a.estimated_cost, a.duration, a.category_id
       FROM itinerary_stops s
       LEFT JOIN cities c ON s.city_id = c.id
       LEFT JOIN itinerary_days d ON s.id = d.stop_id
       LEFT JOIN scheduled_activities sa ON d.id = sa.day_id
       LEFT JOIN activities a ON sa.activity_id = a.id
       WHERE s.itinerary_id = $1
       ORDER BY s."order", d.date, sa.start_time`,
      [id]
    );

    // Transform the flat result into nested structure
    const stopsMap = new Map<string, ItineraryStop>();

    for (const row of stopsResult.rows) {
      if (!stopsMap.has(row.stop_id)) {
        stopsMap.set(row.stop_id, {
          id: row.stop_id,
          city_id: row.city_id,
          city_name: row.city_name,
          country: row.country,
          image_url: row.image_url,
          start_date: row.start_date,
          end_date: row.end_date,
          accommodation: row.accommodation,
          notes: row.stop_notes,
          order: row.stop_order,
          days: []
        });
      }

      const stop = stopsMap.get(row.stop_id)!;

      if (row.day_id) {
        let day = stop.days.find(d => d.id === row.day_id);
        if (!day) {
          day = {
            id: row.day_id,
            date: row.date,
            notes: row.day_notes,
            activities: []
          };
          stop.days.push(day);
        }

        if (row.activity_id) {
          day.activities.push({
            id: row.activity_id,
            activity_id: row.act_id,
            activity_name: row.activity_name,
            start_time: row.start_time,
            end_time: row.end_time,
            estimated_cost: row.estimated_cost,
            actual_cost: row.actual_cost,
            notes: row.activity_notes,
            status: row.status
          });
        }
      }
    }

    return {
      ...itinerary,
      stops: Array.from(stopsMap.values())
    };
  }

  async findByTripId(tripId: string): Promise<Itinerary | null> {
    const result = await query<Itinerary>(
      'SELECT id FROM itineraries WHERE trip_id = $1',
      [tripId]
    );

    if (!result.rows[0]) return null;
    return this.findById(result.rows[0].id);
  }

  async create(data: CreateItineraryDTO): Promise<Itinerary> {
    const result = await query<Itinerary>(
      'INSERT INTO itineraries (trip_id) VALUES ($1) RETURNING *',
      [data.trip_id]
    );

    const itinerary = result.rows[0];

    // Add stops if provided
    if (data.stops && data.stops.length > 0) {
      for (const stop of data.stops) {
        await this.addStop(itinerary.id, stop);
      }
    }

    return (await this.findById(itinerary.id))!;
  }

  async update(id: string, data: UpdateItineraryDTO): Promise<Itinerary | null> {
    // Update stops if provided
    if (data.stops) {
      // Delete existing stops and recreate (simpler approach)
      await query('DELETE FROM itinerary_stops WHERE itinerary_id = $1', [id]);
      
      for (const stop of data.stops) {
        await this.addStop(id, stop);
      }
    }

    return await this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await query('DELETE FROM itineraries WHERE id = $1', [id]);
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async addStop(itineraryId: string, stopData: any): Promise<any> {
    const stopResult = await query(
      `INSERT INTO itinerary_stops (itinerary_id, city_id, start_date, end_date, accommodation, notes, "order") 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [
        itineraryId,
        stopData.city_id,
        stopData.start_date,
        stopData.end_date,
        stopData.accommodation || null,
        stopData.notes || null,
        stopData.order
      ]
    );

    const stop = stopResult.rows[0];

    // Add days if provided
    if (stopData.days && stopData.days.length > 0) {
      for (const day of stopData.days) {
        const dayResult = await query(
          'INSERT INTO itinerary_days (stop_id, date, notes) VALUES ($1, $2, $3) RETURNING *',
          [stop.id, day.date, day.notes || null]
        );

        const dayRecord = dayResult.rows[0];

        // Add activities if provided
        if (day.activities && day.activities.length > 0) {
          for (const activity of day.activities) {
            await this.addActivity(dayRecord.id, activity);
          }
        }
      }
    }

    return stop;
  }

  async updateStop(stopId: string, stopData: any): Promise<any> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (stopData.start_date !== undefined) {
      fields.push(`start_date = $${paramCount++}`);
      values.push(stopData.start_date);
    }
    if (stopData.end_date !== undefined) {
      fields.push(`end_date = $${paramCount++}`);
      values.push(stopData.end_date);
    }
    if (stopData.accommodation !== undefined) {
      fields.push(`accommodation = $${paramCount++}`);
      values.push(stopData.accommodation);
    }
    if (stopData.notes !== undefined) {
      fields.push(`notes = $${paramCount++}`);
      values.push(stopData.notes);
    }
    if (stopData.order !== undefined) {
      fields.push(`"order" = $${paramCount++}`);
      values.push(stopData.order);
    }

    if (fields.length === 0) return null;

    values.push(stopId);
    const result = await query(
      `UPDATE itinerary_stops SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  async deleteStop(stopId: string): Promise<boolean> {
    const result = await query('DELETE FROM itinerary_stops WHERE id = $1', [stopId]);
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async addActivity(dayId: string, activityData: any): Promise<any> {
    const result = await query(
      `INSERT INTO scheduled_activities (day_id, activity_id, start_time, end_time, notes, status, actual_cost) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [
        dayId,
        activityData.activity_id,
        activityData.start_time,
        activityData.end_time || null,
        activityData.notes || null,
        activityData.status || 'planned',
        activityData.actual_cost || null
      ]
    );
    return result.rows[0];
  }

  async removeActivity(scheduledActivityId: string): Promise<boolean> {
    const result = await query('DELETE FROM scheduled_activities WHERE id = $1', [scheduledActivityId]);
    return result.rowCount ? result.rowCount > 0 : false;
  }
}
